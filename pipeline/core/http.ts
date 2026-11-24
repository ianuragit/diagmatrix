/**
 * Polite HTTP client. Every pipeline request goes through here; adapters never
 * call fetch themselves. Enforced in code:
 *
 *  1. robots.txt is fetched (and cached) for a host before any other request
 *     to it; disallowed URLs are skipped, logged, and throw RobotsDisallowedError.
 *  2. Per-host throttle: sequential, at least `minIntervalMs` (default 1000) —
 *     or the robots Crawl-delay if larger — between request starts.
 *  3. Retry with exponential backoff on network errors, 429 and 5xx (max 3 retries),
 *     honouring Retry-After.
 *  4. Disk cache: .cache/http/{host}/{sha1(url)}.html + .meta.json. A cached URL
 *     is never re-fetched unless `refresh` is set (then a conditional request with
 *     If-None-Match / If-Modified-Since is used). `offline` forbids the network.
 *  5. Honest User-Agent carrying a contact address.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { sha1 } from './slug.ts';
import { isAllowed, parseRobots, groupFor, type Robots } from './robots.ts';
import type { Logger } from './log.ts';

export interface CacheMeta {
  url: string;
  final_url: string;
  status: number;
  fetched_at: string;
  etag: string | null;
  last_modified: string | null;
  content_type: string | null;
}

export interface HttpResponse {
  url: string;
  status: number;
  body: string;
  fromCache: boolean;
  meta: CacheMeta;
}

export class RobotsDisallowedError extends Error {
  constructor(public readonly url: string) {
    super(`Disallowed by robots.txt: ${url}`);
    this.name = 'RobotsDisallowedError';
  }
}

export class CacheMissError extends Error {
  constructor(public readonly url: string) {
    super(`Not in cache and network is disabled (offline): ${url}`);
    this.name = 'CacheMissError';
  }
}

export class HttpError extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
  ) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';
  }
}

export interface HttpClientOptions {
  userAgent: string;
  cacheDir?: string;
  refresh?: boolean;
  offline?: boolean;
  minIntervalMs?: number;
  maxRetries?: number;
  timeoutMs?: number;
  log: Logger;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

export interface HttpStats {
  network: number;
  cacheHits: number;
  notModified: number;
  disallowed: string[];
  failures: { url: string; error: string }[];
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Builds an honest, generic UA that identifies the client as a bot. The contact
 * address is appended once contact_email is set (README → Open TODOs); a
 * malformed value is rejected rather than sent.
 */
export function buildUserAgent(contactEmail = ''): string {
  const base = 'CatalogueIndexerBot/0.1 (polite crawler; honours robots.txt; 1 req/s';
  if (!contactEmail) return `${base})`;
  if (!/^[^@\s{}]+@[^@\s{}]+\.[^@\s{}]+$/.test(contactEmail)) {
    throw new Error(
      `contact_email in project.config.yaml is not a valid address ("${contactEmail}")`,
    );
  }
  return `${base}; contact: ${contactEmail})`;
}

export class HttpClient {
  readonly stats: HttpStats = {
    network: 0,
    cacheHits: 0,
    notModified: 0,
    disallowed: [],
    failures: [],
  };
  private readonly opts: Required<Omit<HttpClientOptions, 'fetchImpl'>> & {
    fetchImpl: typeof fetch;
  };
  private readonly robots = new Map<string, Promise<Robots>>();
  private readonly queues = new Map<string, Promise<unknown>>();
  private readonly lastStart = new Map<string, number>();

  constructor(options: HttpClientOptions) {
    this.opts = {
      cacheDir: '.cache/http',
      refresh: false,
      offline: false,
      minIntervalMs: 1000,
      maxRetries: 3,
      timeoutMs: 30_000,
      fetchImpl: globalThis.fetch.bind(globalThis),
      sleep: defaultSleep,
      now: Date.now,
      ...options,
    };
  }

  cachePaths(url: string): { body: string; meta: string; dir: string } {
    const host = new URL(url).host;
    const dir = join(this.opts.cacheDir, host.replace(/[^a-z0-9.-]/gi, '_'));
    const key = sha1(url);
    return { dir, body: join(dir, `${key}.html`), meta: join(dir, `${key}.meta.json`) };
  }

  async readCache(url: string): Promise<HttpResponse | null> {
    const p = this.cachePaths(url);
    if (!existsSync(p.body) || !existsSync(p.meta)) return null;
    const [body, metaRaw] = await Promise.all([readFile(p.body, 'utf8'), readFile(p.meta, 'utf8')]);
    const meta = JSON.parse(metaRaw) as CacheMeta;
    return { url: meta.final_url, status: meta.status, body, fromCache: true, meta };
  }

  private async writeCache(url: string, body: string, meta: CacheMeta): Promise<void> {
    const p = this.cachePaths(url);
    await mkdir(p.dir, { recursive: true });
    await Promise.all([
      writeFile(p.body, body, 'utf8'),
      writeFile(p.meta, JSON.stringify(meta, null, 2) + '\n', 'utf8'),
    ]);
  }

  /** Robots for a host — fetched once per process, cached on disk like any page. */
  async robotsFor(origin: string): Promise<Robots> {
    let p = this.robots.get(origin);
    if (!p) {
      p = this.loadRobots(origin);
      this.robots.set(origin, p);
    }
    return p;
  }

  private async loadRobots(origin: string): Promise<Robots> {
    const url = `${origin}/robots.txt`;
    try {
      const res = await this.fetchCached(url, origin);
      if (res.status >= 200 && res.status < 300) return parseRobots(res.body);
      if (res.status >= 400 && res.status < 500) {
        this.opts.log.info('robots.txt unavailable (4xx) — treating as allow-all', {
          url,
          status: res.status,
        });
        return parseRobots('');
      }
      throw new HttpError(url, res.status);
    } catch (err) {
      if (err instanceof CacheMissError) throw err;
      // RFC 9309 §2.3.1.4: unreachable robots.txt => assume complete disallow.
      this.opts.log.error('robots.txt unreachable — disallowing host', { url, error: String(err) });
      return parseRobots('User-agent: *\nDisallow: /');
    }
  }

  /** Main entry point. */
  async get(url: string): Promise<HttpResponse> {
    const u = new URL(url);
    const robots = await this.robotsFor(u.origin);
    if (!isAllowed(robots, this.opts.userAgent, u.pathname + u.search)) {
      this.stats.disallowed.push(url);
      this.opts.log.warn('skipped: disallowed by robots.txt', { url });
      throw new RobotsDisallowedError(url);
    }
    try {
      return await this.fetchCached(url, u.origin, robots);
    } catch (err) {
      this.stats.failures.push({ url, error: String(err) });
      throw err;
    }
  }

  private async fetchCached(url: string, origin: string, robots?: Robots): Promise<HttpResponse> {
    const cached = await this.readCache(url);
    if (cached && !this.opts.refresh) {
      this.stats.cacheHits++;
      return cached;
    }
    if (this.opts.offline) {
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      throw new CacheMissError(url);
    }
    const crawlDelayMs = (robots && groupFor(robots, this.opts.userAgent)?.crawlDelay) ?? 0;
    const interval = Math.max(this.opts.minIntervalMs, crawlDelayMs * 1000);
    return this.enqueue(origin, () => this.fetchWithRetry(url, interval, cached));
  }

  /** Serialises requests per host so the throttle holds even with concurrent callers. */
  private enqueue<T>(host: string, task: () => Promise<T>): Promise<T> {
    const prev = this.queues.get(host) ?? Promise.resolve();
    const next = prev.catch(() => undefined).then(task);
    this.queues.set(host, next);
    return next;
  }

  private async waitTurn(host: string, interval: number): Promise<void> {
    const last = this.lastStart.get(host);
    if (last !== undefined) {
      const wait = last + interval - this.opts.now();
      if (wait > 0) await this.opts.sleep(wait);
    }
    this.lastStart.set(host, this.opts.now());
  }

  private async fetchWithRetry(
    url: string,
    interval: number,
    cached: HttpResponse | null,
  ): Promise<HttpResponse> {
    const host = new URL(url).host;
    let attempt = 0;
    for (;;) {
      await this.waitTurn(host, interval);
      const headers: Record<string, string> = {
        'user-agent': this.opts.userAgent,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
        'accept-language': 'en',
      };
      if (cached?.meta.etag) headers['if-none-match'] = cached.meta.etag;
      if (cached?.meta.last_modified) headers['if-modified-since'] = cached.meta.last_modified;

      let retryAfterMs: number | null = null;
      let failure: string;
      try {
        this.stats.network++;
        this.opts.log.debug('GET', { url, attempt });
        const res = await this.opts.fetchImpl(url, {
          headers,
          redirect: 'follow',
          signal: AbortSignal.timeout(this.opts.timeoutMs),
        });
        if (res.status === 304 && cached) {
          this.stats.notModified++;
          const meta = { ...cached.meta, fetched_at: new Date(this.opts.now()).toISOString() };
          await this.writeCache(url, cached.body, meta);
          return { ...cached, meta, fromCache: true };
        }
        if (res.status === 429 || res.status >= 500) {
          const ra = res.headers.get('retry-after');
          if (ra)
            retryAfterMs = /^\d+$/.test(ra)
              ? Number(ra) * 1000
              : Math.max(0, Date.parse(ra) - this.opts.now());
          failure = `HTTP ${res.status}`;
          await res.body?.cancel();
        } else {
          const body = await res.text();
          const meta: CacheMeta = {
            url,
            final_url: res.url || url,
            status: res.status,
            fetched_at: new Date(this.opts.now()).toISOString(),
            etag: res.headers.get('etag'),
            last_modified: res.headers.get('last-modified'),
            content_type: res.headers.get('content-type'),
          };
          // 2xx and definitive 4xx are cached, so re-runs never ask again.
          await this.writeCache(url, body, meta);
          return { url: meta.final_url, status: res.status, body, fromCache: false, meta };
        }
      } catch (err) {
        failure = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      }

      if (attempt >= this.opts.maxRetries) {
        this.opts.log.error('giving up', { url, attempts: attempt + 1, failure });
        throw new Error(`Failed after ${attempt + 1} attempts (${failure}): ${url}`);
      }
      const backoff = Math.min(60_000, retryAfterMs ?? 2000 * 2 ** attempt);
      this.opts.log.warn('retrying', { url, attempt: attempt + 1, backoff_ms: backoff, failure });
      await this.opts.sleep(backoff);
      attempt++;
    }
  }
}
