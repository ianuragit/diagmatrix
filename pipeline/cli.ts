#!/usr/bin/env tsx
/**
 * pipeline CLI:  crawl | parse | build-data | validate | report
 *
 *   pnpm crawl [--source id,...] [--refresh] [--offline] [--discover-only] [--limit N]
 *   pnpm parse [--source id,...]
 *   pnpm build-data
 *   pnpm validate
 *   pnpm report
 *
 * Node's built-in fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 is set;
 * set it when crawling behind a proxy.
 */
import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadProjectConfig, requireConfig } from './core/config.ts';
import { HttpClient, RobotsDisallowedError, buildUserAgent } from './core/http.ts';
import { createLogger, type Logger } from './core/log.ts';
import { loadEnabledSources, type LoadedSource } from './core/registry.ts';
import {
  CatalogueSchema,
  NavEntrySchema,
  RawProductSchema,
  type AdapterContext,
  type RawProduct,
} from './core/types.ts';
import { z } from 'zod';

const RAW_DIR = join(ROOT, 'data', 'raw');
const PRODUCTS_JSON = join(ROOT, 'data', 'products.json');

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    source: { type: 'string' },
    refresh: { type: 'boolean', default: false },
    offline: { type: 'boolean', default: false },
    'discover-only': { type: 'boolean', default: false },
    'download-images': { type: 'boolean', default: false },
    limit: { type: 'string' },
  },
});

const log = createLogger('cli');
const only = values.source
  ?.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function writeJson(path: string, data: unknown) {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function makeClient(offline: boolean, logger: Logger): HttpClient {
  const cfg = loadProjectConfig();
  requireConfig(cfg, ['contact_email']);
  return new HttpClient({
    userAgent: buildUserAgent(cfg.site_name, cfg.contact_email, cfg.github_repo),
    cacheDir: join(ROOT, '.cache', 'http'),
    refresh: values.refresh,
    offline,
    log: logger,
  });
}

function ctxFor(http: HttpClient, logger: Logger): AdapterContext {
  return { get: (url) => http.get(url), log: logger };
}

async function crawlSource(src: LoadedSource, http: HttpClient) {
  const slog = log.child(src.config.id);
  const ctx = ctxFor(http, slog);
  const nav = await src.adapter.discover(ctx);
  const unique = [...new Map(nav.map((e) => [e.url, NavEntrySchema.parse(e)])).values()];
  await writeJson(join(RAW_DIR, src.config.id, 'nav.json'), unique);
  slog.info(`discovered ${unique.length} product URLs`);
  if (values['discover-only']) return;

  const limit = values.limit ? Number(values.limit) : Infinity;
  let done = 0;
  for (const entry of unique.slice(0, limit)) {
    try {
      await http.get(entry.url);
    } catch (err) {
      if (!(err instanceof RobotsDisallowedError))
        slog.error('fetch failed', { url: entry.url, error: String(err) });
    }
    if (++done % 50 === 0) slog.info(`fetched ${done}/${Math.min(limit, unique.length)}`);
  }
}

async function cmdCrawl() {
  const sources = await loadEnabledSources({ only });
  const http = makeClient(values.offline, log.child('http'));
  for (const src of sources) await crawlSource(src, http);
  log.info('crawl finished', {
    ...http.stats,
    disallowed: http.stats.disallowed.length,
    failures: http.stats.failures.length,
  });
  if (http.stats.disallowed.length)
    await writeJson(join(RAW_DIR, '_robots-skipped.json'), http.stats.disallowed);
}

async function cmdParse() {
  const sources = await loadEnabledSources({ only });
  const http = makeClient(true, log.child('http')); // parse never touches the network
  for (const src of sources) {
    const slog = log.child(src.config.id);
    const navPath = join(RAW_DIR, src.config.id, 'nav.json');
    if (!existsSync(navPath)) {
      slog.warn('no nav.json — run crawl first');
      continue;
    }
    const nav = z.array(NavEntrySchema).parse(JSON.parse(await readFile(navPath, 'utf8')));
    const outDir = join(RAW_DIR, src.config.id, 'products');
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });
    const failures: { url: string; error: string }[] = [];
    let ok = 0;
    for (const entry of nav) {
      try {
        const res = await http.get(entry.url);
        if (res.status !== 200) throw new Error(`cached status ${res.status}`);
        const parsed = src.adapter.parseProduct(res.body, entry);
        const raw: RawProduct = RawProductSchema.parse({
          ...parsed,
          fetched_at: res.meta.fetched_at,
        });
        await writeJson(join(outDir, `${raw.source_id.replace(/[^A-Za-z0-9_-]/g, '_')}.json`), raw);
        ok++;
      } catch (err) {
        failures.push({ url: entry.url, error: err instanceof Error ? err.message : String(err) });
      }
    }
    await writeJson(join(RAW_DIR, src.config.id, 'parse-failures.json'), failures);
    slog.info(`parsed ${ok}/${nav.length}`, { failures: failures.length });
  }
}

async function cmdValidate() {
  if (!existsSync(PRODUCTS_JSON)) {
    log.warn('data/products.json does not exist yet — nothing to validate');
    return;
  }
  const data = JSON.parse(await readFile(PRODUCTS_JSON, 'utf8'));
  const result = CatalogueSchema.safeParse(data);
  if (!result.success) {
    log.error('schema errors', { issues: result.error.issues.slice(0, 20) });
    process.exitCode = 1;
    return;
  }
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const p of result.data) {
    if (seen.has(p.slug)) dupes.push(`${p.slug} (${seen.get(p.slug)} / ${p.id})`);
    seen.set(p.slug, p.id);
  }
  if (dupes.length) {
    log.error('duplicate slugs', { dupes });
    process.exitCode = 1;
    return;
  }
  log.info(`products.json valid: ${result.data.length} products`);
}

async function loadRaw(sourceId: string): Promise<RawProduct[]> {
  const dir = join(RAW_DIR, sourceId, 'products');
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  return Promise.all(
    files.map(async (f) =>
      RawProductSchema.parse(JSON.parse(await readFile(join(dir, f), 'utf8'))),
    ),
  );
}

async function cmdReport() {
  const sources = await loadEnabledSources({ only });
  for (const src of sources) {
    const raw = await loadRaw(src.config.id);
    const byCat = new Map<string, number>();
    for (const r of raw)
      byCat.set(r.category ?? '(none)', (byCat.get(r.category ?? '(none)') ?? 0) + 1);
    console.log(`\n## ${src.config.id}: ${raw.length} raw records`);
    for (const [cat, n] of [...byCat].sort((a, b) => b[1] - a[1]))
      console.log(`  ${String(n).padStart(5)}  ${cat}`);
  }
}

async function cmdBuildData() {
  throw new Error('build-data is implemented in Phase 4');
}

const commands: Record<string, () => Promise<void>> = {
  crawl: cmdCrawl,
  parse: cmdParse,
  'build-data': cmdBuildData,
  validate: cmdValidate,
  report: cmdReport,
};

const cmd = positionals[0] ?? '';
const run = commands[cmd];
if (!run) {
  console.error(`Usage: tsx pipeline/cli.ts <${Object.keys(commands).join('|')}> [options]`);
  process.exit(2);
}
run().catch((err) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
