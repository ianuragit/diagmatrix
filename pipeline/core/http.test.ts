import { describe, expect, it, beforeEach } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  HttpClient,
  RobotsDisallowedError,
  CacheMissError,
  HostBlockedError,
  HttpError,
  buildUserAgent,
} from './http.ts';
import { createLogger } from './log.ts';

type Route = (req: Request) => Response | Promise<Response>;

function fakeServer(routes: Record<string, Route | Response[]>) {
  const calls: { url: string; at: number; headers: Headers }[] = [];
  let clock = 0;
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    calls.push({ url: req.url, at: clock, headers: req.headers });
    const r = routes[req.url];
    if (!r) return new Response('nope', { status: 404 });
    if (Array.isArray(r)) return r.shift() ?? new Response('exhausted', { status: 500 });
    return r(req);
  }) as typeof fetch;
  const sleeps: number[] = [];
  return {
    calls,
    sleeps,
    fetchImpl,
    now: () => clock,
    sleep: async (ms: number) => {
      sleeps.push(ms);
      clock += ms;
    },
  };
}

const UA = buildUserAgent('ops@example.com');
const ORIGIN = 'https://shop.test';
let cacheDir: string;

beforeEach(() => {
  cacheDir = mkdtempSync(join(tmpdir(), 'dm-http-'));
});

function client(
  s: ReturnType<typeof fakeServer>,
  extra: Partial<ConstructorParameters<typeof HttpClient>[0]> = {},
) {
  return new HttpClient({
    userAgent: UA,
    cacheDir,
    log: createLogger('test', { silent: !process.env.DBG, level: 'debug' }),
    fetchImpl: s.fetchImpl,
    sleep: s.sleep,
    now: s.now,
    ...extra,
  });
}

describe('HttpClient', () => {
  it('fetches robots.txt first and refuses disallowed paths', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response('User-agent: *\nDisallow: /admin'),
      [`${ORIGIN}/a.html`]: () => new Response('<p>a</p>'),
    });
    const c = client(s);
    await expect(c.get(`${ORIGIN}/admin/x`)).rejects.toBeInstanceOf(RobotsDisallowedError);
    expect(s.calls.map((x) => x.url)).toEqual([`${ORIGIN}/robots.txt`]);
    const res = await c.get(`${ORIGIN}/a.html`);
    expect(res.body).toBe('<p>a</p>');
    expect(c.stats.disallowed).toEqual([`${ORIGIN}/admin/x`]);
  });

  it('throttles to >= 1s between requests per host and sends the UA', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
      [`${ORIGIN}/1`]: () => new Response('1'),
      [`${ORIGIN}/2`]: () => new Response('2'),
      [`${ORIGIN}/3`]: () => new Response('3'),
    });
    const c = client(s);
    await Promise.all([c.get(`${ORIGIN}/1`), c.get(`${ORIGIN}/2`), c.get(`${ORIGIN}/3`)]);
    const times = s.calls.map((x) => x.at);
    for (let i = 1; i < times.length; i++)
      expect(times[i]! - times[i - 1]!).toBeGreaterThanOrEqual(1000);
    expect(s.calls[1]!.headers.get('user-agent')).toContain('ops@example.com');
  });

  it('honours a larger Crawl-delay', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response('User-agent: *\nCrawl-delay: 5'),
      [`${ORIGIN}/1`]: () => new Response('1'),
      [`${ORIGIN}/2`]: () => new Response('2'),
    });
    const c = client(s);
    await c.get(`${ORIGIN}/1`);
    await c.get(`${ORIGIN}/2`);
    expect(s.calls[2]!.at - s.calls[1]!.at).toBeGreaterThanOrEqual(5000);
  });

  it('applies a per-host interval override', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
      [`${ORIGIN}/1`]: () => new Response('1'),
      [`${ORIGIN}/2`]: () => new Response('2'),
    });
    const c = client(s, { hostIntervals: { 'shop.test': 8000 } });
    await c.get(`${ORIGIN}/1`);
    await c.get(`${ORIGIN}/2`);
    expect(s.calls[2]!.at - s.calls[1]!.at).toBeGreaterThanOrEqual(8000);
  });

  it('retries 5xx with backoff, max 3 retries', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
      [`${ORIGIN}/flaky`]: [
        new Response('x', { status: 503 }),
        new Response('x', { status: 500 }),
        new Response('ok'),
      ],
      [`${ORIGIN}/dead`]: () => new Response('x', { status: 502 }),
    });
    const c = client(s);
    expect((await c.get(`${ORIGIN}/flaky`)).body).toBe('ok');
    await expect(c.get(`${ORIGIN}/dead`)).rejects.toThrow(/4 attempts/);
    expect(s.calls.filter((x) => x.url.endsWith('/dead'))).toHaveLength(4);
  });

  it('serves a second run entirely from disk cache (zero network)', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
      [`${ORIGIN}/p`]: () => new Response('page', { headers: { etag: '"v1"' } }),
    });
    await client(s).get(`${ORIGIN}/p`);
    const before = s.calls.length;
    const second = client(s);
    const res = await second.get(`${ORIGIN}/p`);
    expect(res.fromCache).toBe(true);
    expect(res.body).toBe('page');
    expect(s.calls.length).toBe(before);
    expect(second.stats.network).toBe(0);
  });

  it('offline mode never hits the network; refresh sends a conditional request', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
      [`${ORIGIN}/p`]: (req) =>
        req.headers.get('if-none-match') === '"v1"'
          ? new Response(null, { status: 304 })
          : new Response('page', { headers: { etag: '"v1"' } }),
    });
    await expect(client(s, { offline: true }).get(`${ORIGIN}/p`)).rejects.toBeInstanceOf(
      CacheMissError,
    );
    expect(s.calls).toHaveLength(0);
    await client(s).get(`${ORIGIN}/p`);
    const r = client(s, { refresh: true });
    const res = await r.get(`${ORIGIN}/p`);
    expect(res.body).toBe('page');
    expect(r.stats.notModified).toBe(1);
  });

  it('never caches 403s and stops requesting a host after 3 consecutive blocks', async () => {
    const routes: Record<string, () => Response> = {
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
    };
    for (let i = 1; i <= 10; i++)
      routes[`${ORIGIN}/p${i}`] = () => new Response('blocked', { status: 403 });
    const s = fakeServer(routes);
    const c = client(s);
    for (let i = 1; i <= 3; i++)
      await expect(c.get(`${ORIGIN}/p${i}`)).rejects.toBeInstanceOf(HttpError);
    const sent = s.calls.length;
    for (let i = 4; i <= 10; i++)
      await expect(c.get(`${ORIGIN}/p${i}`)).rejects.toBeInstanceOf(HostBlockedError);
    expect(s.calls.length).toBe(sent); // fail fast, zero extra requests
    expect(await c.readCache(`${ORIGIN}/p1`)).toBeNull();
  });

  it('a success between 403s resets the block streak', async () => {
    const s = fakeServer({
      [`${ORIGIN}/robots.txt`]: () => new Response(''),
      [`${ORIGIN}/a`]: () => new Response('x', { status: 403 }),
      [`${ORIGIN}/b`]: () => new Response('x', { status: 403 }),
      [`${ORIGIN}/ok`]: () => new Response('ok'),
      [`${ORIGIN}/c`]: () => new Response('x', { status: 403 }),
    });
    const c = client(s);
    for (const p of ['a', 'b'])
      await expect(c.get(`${ORIGIN}/${p}`)).rejects.toBeInstanceOf(HttpError);
    await c.get(`${ORIGIN}/ok`);
    await expect(c.get(`${ORIGIN}/c`)).rejects.toBeInstanceOf(HttpError);
    expect(c.blockedHosts.size).toBe(0);
  });

  it('builds a generic UA, adding contact only when set and valid', () => {
    expect(buildUserAgent('')).toMatch(/^CatalogueIndexerBot\/0\.1 \(.*\)$/);
    expect(buildUserAgent('')).not.toContain('contact');
    expect(buildUserAgent('a@b.co')).toContain('contact: a@b.co');
    expect(() => buildUserAgent('{{CONTACT_EMAIL}}')).toThrow(/contact_email/);
  });
});
