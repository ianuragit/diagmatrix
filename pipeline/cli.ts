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
import {
  ROOT,
  CONFIG_DIR,
  loadProjectConfig,
  loadYaml,
  loadLocalSources,
  privateTerms,
  LOCAL_SOURCES,
} from './core/config.ts';
import { build, type BuildReport, type ManualProduct } from './normalise/merge.ts';
import type { BrandConfig } from './normalise/brand.ts';
import type { Taxonomy } from './normalise/classify.ts';
import { Translator, type TranslationConfig } from './normalise/translate.ts';
import { buildAudit, checkBrands, type AuditInput, type BrandCheck } from './quality/audit.ts';
import {
  US_PRIORITY,
  buildQuery,
  matchRecords,
  queryWords,
  type EnrichmentEntry,
  type GudidRecord,
} from './enrich/fda-gudid.ts';
import { filesToScan, scanForTerms } from './core/privacy.ts';
import {
  CacheMissError,
  HttpClient,
  HostBlockedError,
  RobotsDisallowedError,
  buildUserAgent,
} from './core/http.ts';
import { createLogger, type Logger } from './core/log.ts';
import { loadEnabledSources, type LoadedSource } from './core/registry.ts';
import {
  CatalogueSchema,
  NavEntrySchema,
  RawProductSchema,
  type AdapterContext,
  type Product,
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
    'allow-shrink': { type: 'boolean', default: false },
    reslug: { type: 'boolean', default: false },
    'max-requests': { type: 'string' },
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

function makeClient(offline: boolean, logger: Logger, sources: LoadedSource[] = []): HttpClient {
  const hostIntervals: Record<string, number> = {};
  for (const s of sources)
    if (s.config.minIntervalMs)
      hostIntervals[new URL(s.config.baseUrl).host] = s.config.minIntervalMs;
  const cfg = loadProjectConfig();
  return new HttpClient({
    userAgent: buildUserAgent(cfg.contact_email),
    cacheDir: join(ROOT, '.cache', 'http'),
    refresh: values.refresh,
    offline,
    log: logger,
    hostIntervals,
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

  // Don't fetch what build-data would drop anyway (taxonomy.yaml → scope.exclude_source_categories).
  const tax = loadYaml<Taxonomy>(join(CONFIG_DIR, 'taxonomy.yaml'));
  const excluded = new Set(tax.scope.exclude_source_categories[src.config.id] ?? []);
  const inScope = unique.filter((e) => !excluded.has(e.category));
  if (inScope.length < unique.length)
    slog.info(`scope: skipping ${unique.length - inScope.length} pages in excluded categories`);

  const limit = values.limit ? Number(values.limit) : Infinity;
  const maxRequests = values['max-requests'] ? Number(values['max-requests']) : Infinity;
  const startNetwork = http.stats.network;
  let done = 0;
  let fetched = 0;
  let frozenSkipped = 0;
  const todo = inScope.slice(0, limit);
  for (const entry of todo) {
    if (http.stats.network - startNetwork >= maxRequests) {
      slog.info(
        `max-requests reached (${maxRequests}); stopping this batch — re-run to continue from the cache`,
      );
      break;
    }
    try {
      const res = await http.get(entry.url);
      if (!res.fromCache) fetched++;
    } catch (err) {
      if (err instanceof HostBlockedError) {
        slog.error(
          `stopping ${src.config.id}: the site is blocking requests. ${fetched} new pages fetched this run; cached pages are kept.`,
        );
        process.exitCode = 3;
        break;
      }
      if (err instanceof CacheMissError && src.config.frozen) {
        frozenSkipped++;
        continue;
      }
      if (!(err instanceof RobotsDisallowedError))
        slog.error('fetch failed', { url: entry.url, error: String(err) });
    }
    if (++done % 50 === 0 && !src.config.frozen)
      slog.info(`progress ${done}/${todo.length} (new this run: ${fetched})`);
  }
  if (frozenSkipped)
    slog.info(`frozen: ${frozenSkipped} uncached pages skipped without any request`);
  if (!src.config.frozen) slog.info(`done: ${fetched} new pages fetched this run`);
}

async function cmdCrawl() {
  const sources = await loadEnabledSources({ only });
  const http = makeClient(values.offline, log.child('http'), sources);
  const cache = makeClient(true, log.child('http'), sources);
  for (const src of sources) {
    if (src.config.frozen) log.info(`${src.config.id} is frozen: cache only, no network requests`);
    try {
      await crawlSource(src, src.config.frozen ? cache : http);
    } catch (err) {
      // One source failing (e.g. a frozen source with no cache on a CI runner) must not stop the others.
      log.error(`crawl of ${src.config.id} failed; continuing with other sources`, {
        error: err instanceof Error ? err.message : String(err),
      });
      process.exitCode = 1;
    }
  }
  const net = http.stats;
  log.info('crawl finished', {
    ...net,
    cacheHits: net.cacheHits + cache.stats.cacheHits,
    disallowed: http.stats.disallowed.length,
    failures: http.stats.failures.length,
  });
  if (http.stats.disallowed.length)
    await writeJson(join(RAW_DIR, '_robots-skipped.json'), http.stats.disallowed);
  // Parse straight away so `pnpm crawl && pnpm build-data` works (raw records are git-ignored).
  if (!values['discover-only']) await cmdParse();
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

async function cmdPrivacyCheck(): Promise<boolean> {
  if (!existsSync(LOCAL_SOURCES)) {
    log.info('privacy-check: no sources.local.yaml, nothing to check against');
    return true;
  }
  const hits = scanForTerms(filesToScan(ROOT), privateTerms(), ROOT);
  if (hits.length) {
    // Print locations only, never the matched term, so logs stay clean too.
    log.error(`privacy-check: ${hits.length} private-term hit(s)`, {
      at: hits.slice(0, 50).map((h) => `${h.file}:${h.line}`),
    });
    process.exitCode = 1;
    return false;
  }
  log.info('privacy-check: clean');
  return true;
}

async function cmdValidate() {
  await cmdPrivacyCheck();
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
  // English-only site: refuse to publish leftover German.
  const tr = new Translator(loadYaml<TranslationConfig>(join(CONFIG_DIR, 'translations.yaml')));
  const foreign: string[] = [];
  for (const p of result.data) {
    const texts = [
      p.name,
      p.summary ?? '',
      ...Object.keys(p.specs),
      ...Object.values(p.specs),
      ...p.documents.map((d) => d.title),
    ];
    const words = [...new Set(texts.flatMap((t) => tr.leftovers(t)))];
    if (words.length) foreign.push(`${p.id}: ${words.join(', ')}`);
  }
  if (foreign.length) {
    log.error(
      `non-English text in ${foreign.length} products (add to pipeline/config/translations.yaml)`,
      { examples: foreign.slice(0, 20) },
    );
    process.exitCode = 1;
    return;
  }
  log.info(`products.json valid: ${result.data.length} products, English-only`);
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

/**
 * Markdown report on raw records. Safe to publish (e.g. as a PR body): it never
 * prints source URLs, record ids or image URLs.
 */
async function cmdReport() {
  await reportRaw();
  await reportCatalogue();
}

async function reportRaw() {
  const sources = await loadEnabledSources({ only });
  const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : '–');
  for (const src of sources) {
    const id = src.config.id;
    const raw = await loadRaw(id);
    const navPath = join(RAW_DIR, id, 'nav.json');
    const nav: { category: string }[] = existsSync(navPath)
      ? JSON.parse(await readFile(navPath, 'utf8'))
      : [];
    const failPath = join(RAW_DIR, id, 'parse-failures.json');
    const failures: { url: string; error: string }[] = existsSync(failPath)
      ? JSON.parse(await readFile(failPath, 'utf8'))
      : [];

    console.log(`\n## Source \`${id}\`\n`);
    console.log(
      `- Nav entries: ${nav.length}\n- Parsed records: ${raw.length}\n- Parse failures: ${failures.length}\n`,
    );

    const navByCat = new Map<string, number>();
    for (const e of nav) navByCat.set(e.category, (navByCat.get(e.category) ?? 0) + 1);
    const rawByCat = new Map<string, number>();
    for (const r of raw)
      rawByCat.set(r.category ?? '(none)', (rawByCat.get(r.category ?? '(none)') ?? 0) + 1);
    const navKnowsCategories = !(navByCat.size === 1 && navByCat.has('Uncategorised'));
    if (navKnowsCategories) {
      console.log('### Categories\n\n| Category | In nav | Parsed |\n|---|---:|---:|');
      for (const [cat, n] of [...navByCat].sort((a, b) => b[1] - a[1]))
        console.log(`| ${cat} | ${n} | ${rawByCat.get(cat) ?? 0} |`);
    } else {
      // Category only known after parsing (e.g. sitemap discovery).
      console.log('### Categories (from parsed pages)\n\n| Category | Parsed |\n|---|---:|');
      for (const [cat, n] of [...rawByCat].sort((a, b) => b[1] - a[1]))
        console.log(`| ${cat} | ${n} |`);
    }
    const extra = navKnowsCategories ? [...rawByCat.keys()].filter((c) => !navByCat.has(c)) : [];
    if (extra.length) console.log(`\nBreadcrumb categories not in nav: ${extra.join(', ')}`);

    const cov: [string, (r: RawProduct) => boolean][] = [
      ['brand (stated)', (r) => !!r.brand],
      ['catalogue_no', (r) => !!r.catalogue_no],
      ['fact table', (r) => Object.keys(r.facts).length > 0],
      ['spec rows', (r) => Object.keys(r.specs).length > 0],
      ['image', (r) => !!r.image],
      ['documents', (r) => r.documents.length > 0],
      ['components', (r) => r.components.length > 0],
      ['related (source-linked)', (r) => r.related_source_ids.length > 0],
      ['description', (r) => !!r.description_raw],
    ];
    console.log('\n### Field coverage\n\n| Field | Records | % |\n|---|---:|---:|');
    for (const [label, f] of cov) {
      const n = raw.filter(f).length;
      console.log(`| ${label} | ${n} | ${pct(n, raw.length)} |`);
    }
    const factKeys = new Map<string, number>();
    for (const r of raw)
      for (const k of Object.keys(r.facts)) factKeys.set(k, (factKeys.get(k) ?? 0) + 1);
    console.log(
      '\nTop fact-table keys: ' +
        [...factKeys]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([k, n]) => `${k} (${n})`)
          .join(', '),
    );

    // Deterministic sample spread over categories.
    const sorted = [...raw].sort((a, b) => a.name.localeCompare(b.name));
    const cats = [...rawByCat.keys()];
    const sample: RawProduct[] = [];
    for (let i = 0; sample.length < Math.min(10, raw.length) && i < raw.length; i++) {
      const cat = cats[sample.length % cats.length];
      const pick =
        sorted.find((r) => r.category === cat && !sample.includes(r)) ??
        sorted.find((r) => !sample.includes(r));
      if (pick) sample.push(pick);
    }
    console.log('\n### Sample records\n');
    for (const r of sample) {
      // Never print source URLs/ids, images, prose, document lists or related ids.
      const {
        url: _u,
        source_id: _s,
        image: _i,
        description_raw: d,
        specs,
        documents,
        components,
        related_source_ids: _r,
        ...rest
      } = r;
      console.log(
        '```json\n' +
          JSON.stringify(
            {
              ...rest,
              image: r.image ? '(present)' : null,
              documents: documents.length,
              components: components.map((c) => c.name).slice(0, 5),
              spec_rows: Object.keys(specs).length,
              specs_preview: Object.fromEntries(Object.entries(specs).slice(0, 4)),
              description_chars: d?.length ?? 0,
            },
            null,
            2,
          ) +
          '\n```',
      );
    }

    if (failures.length) {
      const byErr = new Map<string, number>();
      for (const f of failures)
        byErr.set(
          f.error.replace(/https?:\/\/\S+/g, '<url>'),
          (byErr.get(f.error.replace(/https?:\/\/\S+/g, '<url>')) ?? 0) + 1,
        );
      console.log('\n### Parse failures by reason\n');
      for (const [e, n] of byErr) console.log(`- ${n} × ${e}`);
    }
  }
}

/** Catalogue section of the report (Phase 4+). Publishes no source URLs or ids. */
async function reportCatalogue() {
  if (!existsSync(PRODUCTS_JSON)) return;
  const all = CatalogueSchema.parse(JSON.parse(await readFile(PRODUCTS_JSON, 'utf8')));
  const live = all.filter((p) => !p.duplicate_of);
  const pct = (n: number) => `${((100 * n) / (live.length || 1)).toFixed(1)}%`;
  console.log(
    `\n## Catalogue\n\n- Records: ${all.length} (${live.length} canonical, ${all.length - live.length} flagged duplicates)`,
  );

  const provPath = join(PRIVATE_DIR, 'provenance.json');
  if (existsSync(provPath)) {
    const prov = JSON.parse(await readFile(provPath, 'utf8')) as Record<
      string,
      { source: string }[]
    >;
    const bySrc = new Map<string, number>();
    for (const p of live)
      for (const s of new Set((prov[p.id] ?? []).map((r) => r.source)))
        bySrc.set(s, (bySrc.get(s) ?? 0) + 1);
    const multi = live.filter(
      (p) => new Set((prov[p.id] ?? []).map((r) => r.source)).size > 1,
    ).length;
    console.log(
      `- Canonical products by source: ${[...bySrc].map(([s, n]) => `${s} ${n}`).join(', ')} (in more than one source: ${multi})`,
    );
  }
  const count = (f: (p: Product) => string | null | undefined) => {
    const m = new Map<string, number>();
    for (const p of live) {
      const k = f(p) ?? '(none)';
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  console.log(
    '\n### By category / product type\n\n| Category | Instruments | Tests & reagents | Controls | Consumables | Unknown | Total |\n|---|---:|---:|---:|---:|---:|---:|',
  );
  for (const [cat, n] of count((p) => p.category)) {
    const c = (sub: string | null) =>
      live.filter((p) => (p.category ?? '(none)') === cat && p.subcategory === sub).length;
    console.log(
      `| ${cat} | ${c('instrument')} | ${c('reagent')} | ${c('control')} | ${c('consumable')} | ${c(null)} | ${n} |`,
    );
  }
  console.log(
    '\n### Brands\n\n| Brand | Products | Instruments | Tests & reagents |\n|---|---:|---:|---:|',
  );
  for (const [b, n] of count((p) => p.brand)) {
    const inst = live.filter(
      (p) => (p.brand ?? '(none)') === b && p.product_type === 'instrument',
    ).length;
    const reag = live.filter(
      (p) => (p.brand ?? '(none)') === b && p.product_type === 'reagent',
    ).length;
    console.log(`| ${b} | ${n} | ${inst} | ${reag} |`);
  }

  const fields: [string, (p: Product) => boolean][] = [
    ['name', (p) => !!p.name],
    ['brand', (p) => !!p.brand],
    ['product_line', (p) => !!p.product_line],
    ['category', (p) => !!p.category && p.category !== 'general'],
    ['subcategory', (p) => !!p.subcategory],
    ['technology', (p) => !!p.technology],
    ['analyte', (p) => p.analyte.length > 0],
    ['sample_type', (p) => p.sample_type.length > 0],
    ['product_type', (p) => !!p.product_type],
    ['subtype', (p) => !!p.subtype],
    ['pack_size', (p) => !!p.pack_size],
    ['catalogue_no', (p) => !!p.catalogue_no],
    ['specs (≥1 row)', (p) => Object.keys(p.specs).length > 0],
    ['summary', (p) => !!p.summary],
    ['image_local', (p) => !!p.image_local],
    ['documents', (p) => p.documents.length > 0],
    ['related', (p) => p.related.length > 0],
    ['classification_confidence ≥ 0.7', (p) => p.classification_confidence >= 0.7],
  ];
  console.log(
    '\n### Field coverage (canonical products)\n\n| Field | Filled | % |\n|---|---:|---:|',
  );
  for (const [f, test] of fields) {
    const n = live.filter(test).length;
    console.log(`| ${f} | ${n} | ${pct(n)} |`);
  }

  if (existsSync(DUPLICATES_JSON)) {
    const d = JSON.parse(await readFile(DUPLICATES_JSON, 'utf8')) as {
      duplicate_groups: { canonical: string; members: { id: string; name: string }[] }[];
      cross_source_merges: { id: string; name: string; listings: number }[];
    };
    console.log(
      `\n### Duplicate groups (${d.duplicate_groups.length}) — non-canonical records are hidden and redirect\n`,
    );
    for (const g of d.duplicate_groups)
      console.log(
        `- **${g.members[0]!.name}** ← ${g.members
          .slice(1)
          .map((m) => `\`${m.id}\``)
          .join(', ')}`,
      );
    console.log(`\n### Cross-source merges (${d.cross_source_merges.length})\n`);
    for (const m of d.cross_source_merges) console.log(`- ${m.name} (${m.listings} listings)`);
  }
  const brPath = join(PRIVATE_DIR, 'build-report.json');
  if (existsSync(brPath)) {
    const r = JSON.parse(await readFile(brPath, 'utf8')) as BuildReport;
    console.log(`\n### Scope filter\n\n- Dropped as non-diagnostic: ${r.dropped.length}`);
    for (const x of r.dropped.slice(0, 20)) console.log(`  - ${x.name} — ${x.reason}`);
    console.log(
      `- Instrument child tests expanded into own records: ${r.componentsExpanded}; matched to existing pages: ${r.componentsMatchedToPages}`,
    );
    console.log(
      `\n### Brand checks\n\n- Name-derived brand disagreed with the stated brand (${r.brandConflicts.length}):`,
    );
    for (const c of r.brandConflicts)
      console.log(`  - ${c.name}: using **${c.brand}**, source said ${c.stated}`);
    console.log(
      `- Stated brands not in brands.yaml (passed through, tidied): ${r.unknownStatedBrands.length} — ${r.unknownStatedBrands.map((b) => `${b.brand} (${b.count})`).join(', ')}`,
    );
    console.log(
      `- Products with no brand: ${r.noBrand.length}${r.noBrand.length ? ' — ' + r.noBrand.map((b) => b.name).join(', ') : ''}`,
    );
    console.log(`\n### Low classification confidence (< 0.6): ${r.lowConfidence.length}\n`);
    for (const l of r.lowConfidence.slice(0, 40))
      console.log(
        `- ${l.name} — ${l.confidence} (tech: ${l.basis.technology}, analyte: ${l.basis.analyte}, sample: ${l.basis.sample}, type: ${l.basis.type})`,
      );
    if (r.overridesUnknown.length)
      console.log(`\nOverrides for unknown ids: ${r.overridesUnknown.join(', ')}`);
  }
}

const ManualFileSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().min(1),
      brand: z.string().nullable().optional(),
      catalogue_no: z.string().nullable().optional(),
      pack_size: z.string().nullable().optional(),
      sample_type: z.string().nullable().optional(),
      analytes: z.array(z.string()).optional(),
      technology: z.string().nullable().optional(),
      product_type: z.enum(['instrument', 'reagent', 'consumable']).nullable().optional(),
      specs: z.record(z.string(), z.string()).optional(),
      documents: z
        .array(z.object({ title: z.string(), url: z.url(), type: z.string() }))
        .optional(),
    }),
  ),
});

async function loadManual(): Promise<ManualProduct[]> {
  const dir = join(ROOT, 'data', 'manual');
  if (!existsSync(dir)) return [];
  const out: ManualProduct[] = [];
  for (const f of (await readdir(dir)).filter((f) => /\.ya?ml$/.test(f)).sort()) {
    const doc = ManualFileSchema.parse(loadYaml(join(dir, f)) ?? { products: [] });
    for (const p of doc.products)
      out.push({ ...p, file: f.replace(/\.ya?ml$/, '') } as ManualProduct);
  }
  return out;
}

const ID_MAP = join(ROOT, 'data', 'id-map.json');
const DUPLICATES_JSON = join(ROOT, 'data', 'duplicates.json');
const REDIRECTS_JSON = join(ROOT, 'data', 'redirects.json');
const PRIVATE_DIR = join(ROOT, 'data', 'private');

async function cmdBuildData() {
  const sources = await loadEnabledSources({ only });
  const inputs = [];
  for (const s of sources) {
    const records = await loadRaw(s.config.id);
    inputs.push({
      id: s.config.id,
      priority: s.config.priority,
      hosts: [new URL(s.config.baseUrl).hostname],
      records,
    });
    log.info(`loaded ${records.length} raw records from ${s.config.id}`);
  }
  const manual = await loadManual();
  const idMap = new Map<string, string>(
    existsSync(ID_MAP)
      ? Object.entries(JSON.parse(await readFile(ID_MAP, 'utf8')) as Record<string, string>)
      : [],
  );
  const overridesDoc = loadYaml<{ overrides?: Record<string, Partial<Product>> }>(
    join(CONFIG_DIR, 'overrides.yaml'),
  );
  const result = build({
    sources: inputs,
    manual,
    brands: loadYaml<BrandConfig>(join(CONFIG_DIR, 'brands.yaml')),
    taxonomy: loadYaml<Taxonomy>(join(CONFIG_DIR, 'taxonomy.yaml')),
    overrides: overridesDoc?.overrides ?? {},
    idMap,
    privateTerms: loadLocalSources().private_terms,
    translations: loadYaml<TranslationConfig>(join(CONFIG_DIR, 'translations.yaml')),
    reslug: values.reslug,
    catalogueEnrichment: existsSync(FDA_ENRICH)
      ? JSON.parse(await readFile(FDA_ENRICH, 'utf8'))
      : {},
  });
  // Guard: a refresh with a missing cache or a broken source must not silently delete products.
  if (existsSync(PRODUCTS_JSON) && !values['allow-shrink']) {
    const before = (
      JSON.parse(await readFile(PRODUCTS_JSON, 'utf8')) as { duplicate_of: string | null }[]
    ).filter((p) => !p.duplicate_of).length;
    const after = result.products.filter((p) => !p.duplicate_of).length;
    if (before > 0 && before - after > Math.min(20, before * 0.02)) {
      throw new Error(
        `catalogue would shrink from ${before} to ${after} canonical products (allowed drop: 2% or 20, whichever is smaller). Check sources/cache, or re-run with --allow-shrink.`,
      );
    }
  }
  await writeJson(PRODUCTS_JSON, result.products);
  await writeJson(DUPLICATES_JSON, result.duplicates);
  // Redirects accumulate across builds so old URLs keep working.
  const prev: Record<string, string> = existsSync(REDIRECTS_JSON)
    ? JSON.parse(await readFile(REDIRECTS_JSON, 'utf8'))
    : {};
  const liveIds = new Set(result.products.map((p) => p.id));
  const all = { ...prev, ...result.redirects };
  const resolved: Record<string, string> = {};
  for (const [from, to] of Object.entries(all)) {
    if (liveIds.has(from)) continue; // became a product again
    let target = to;
    for (let i = 0; i < 10 && !liveIds.has(target) && all[target]; i++) target = all[target]!;
    if (liveIds.has(target)) resolved[from] = target;
  }
  await writeJson(REDIRECTS_JSON, Object.fromEntries(Object.entries(resolved).sort()));
  if (Object.keys(result.redirects).length)
    log.info(
      `redirects: ${Object.keys(result.redirects).length} new, ${Object.keys(resolved).length} total`,
    );
  await writeJson(
    ID_MAP,
    Object.fromEntries([...result.idMap].sort((a, b) => a[0].localeCompare(b[0]))),
  );
  await writeJson(join(PRIVATE_DIR, 'provenance.json'), result.provenance);
  await writeJson(join(PRIVATE_DIR, 'build-report.json'), result.report);
  const live = result.products.filter((p) => !p.duplicate_of).length;
  log.info('build-data finished', {
    products: result.products.length,
    canonical: live,
    duplicates: result.products.length - live,
    duplicate_groups: result.duplicates.duplicate_groups.length,
    cross_source_merges: result.duplicates.cross_source_merges.length,
    dropped_out_of_scope: result.report.dropped.length,
    manual: manual.length,
  });
}

async function cmdAudit() {
  const products = CatalogueSchema.parse(JSON.parse(await readFile(PRODUCTS_JSON, 'utf8')));
  const readOpt = async <T>(path: string): Promise<T | null> =>
    existsSync(path) ? (JSON.parse(await readFile(path, 'utf8')) as T) : null;
  const report = await readOpt<BuildReport>(join(PRIVATE_DIR, 'build-report.json'));
  const duplicates = await readOpt<AuditInput['duplicates']>(DUPLICATES_JSON);
  const prov = await readOpt<Record<string, { source: string }[]>>(
    join(PRIVATE_DIR, 'provenance.json'),
  );
  const brands = loadYaml<AuditInput['brands']>(join(CONFIG_DIR, 'brands.yaml'));
  const cachePath = join(ROOT, 'data', 'brand-verification.json');
  const cached = new Map(((await readOpt<BrandCheck[]>(cachePath)) ?? []).map((c) => [c.brand, c]));
  const inUse = new Set(products.filter((p) => !p.duplicate_of && p.brand).map((p) => p.brand!));
  const brandChecks = await checkBrands(brands.brands, inUse, cached, {
    refresh: values.refresh,
    offline: values.offline,
  });
  await writeJson(
    cachePath,
    [...brandChecks.values()].sort((a, b) => a.brand.localeCompare(b.brand)),
  );
  const { markdown, csv } = buildAudit({
    products,
    report,
    duplicates,
    brands,
    brandChecks,
    ...(prov
      ? { sourcesOf: (id: string) => [...new Set((prov[id] ?? []).map((r) => r.source))] }
      : {}),
  });
  await mkdir(join(ROOT, 'docs'), { recursive: true });
  await writeFile(join(ROOT, 'docs', 'data-quality-report.md'), markdown, 'utf8');
  await writeFile(join(ROOT, 'docs', 'missing-data.csv'), csv, 'utf8');
  const bad = [...brandChecks.values()].filter((c) => !c.resolves);
  log.info('audit written: docs/data-quality-report.md, docs/missing-data.csv', {
    brands: brandChecks.size,
    brands_not_resolving: bad.map((b) => b.brand),
    incomplete: csv.split('\n').length - 2,
  });
}

const FDA_ENRICH = join(ROOT, 'data', 'enrichment', 'fda-gudid.json');

/** Catalogue numbers from FDA GUDID (openFDA) for products that have none. Resumable, rate-limited. */
async function cmdEnrichFda() {
  const products = CatalogueSchema.parse(JSON.parse(await readFile(PRODUCTS_JSON, 'utf8')));
  const store: Record<string, EnrichmentEntry> = existsSync(FDA_ENRICH)
    ? JSON.parse(await readFile(FDA_ENRICH, 'utf8'))
    : {};
  const prio = (b: string | null) => (b && US_PRIORITY.includes(b) ? US_PRIORITY.indexOf(b) : 999);
  const todo = products
    .filter(
      (p) => !p.duplicate_of && !p.catalogue_no && p.brand && (values.refresh || !store[p.id]),
    )
    .sort((a, b) => prio(a.brand) - prio(b.brand) || a.id.localeCompare(b.id));
  const max = values['max-requests'] ? Number(values['max-requests']) : 900;
  const http = new HttpClient({
    userAgent: buildUserAgent(loadProjectConfig().contact_email),
    cacheDir: join(ROOT, '.cache', 'http'),
    log: log.child('fda'),
    minIntervalMs: 1100,
    offline: values.offline,
  });
  log.info(
    `enrich-fda: ${todo.length} products without catalogue number to check (budget ${max} requests)`,
  );
  let checked = 0;
  for (const p of todo) {
    if (http.stats.network >= max) {
      log.info(`request budget reached (${max}); re-run later to continue`);
      break;
    }
    const words = queryWords(p);
    if (!words.length) {
      store[p.id] = {
        status: 'skipped',
        catalogue_no: null,
        candidates: [],
        query: null,
        checked_at: new Date().toISOString(),
      };
      continue;
    }
    const q = buildQuery(words);
    let records: GudidRecord[] = [];
    try {
      const res = await http.get(`https://api.fda.gov/device/udi.json?search=${q}&limit=100`);
      if (res.status === 200)
        records = (JSON.parse(res.body) as { results?: GudidRecord[] }).results ?? [];
    } catch (err) {
      if (err instanceof HostBlockedError) {
        log.error('openFDA is refusing requests (rate limit) — stopping; re-run later');
        break;
      }
      log.warn('openFDA request failed', { id: p.id, error: String(err) });
      continue;
    }
    store[p.id] = matchRecords(p, records, q);
    if (++checked % 50 === 0) {
      await writeJson(FDA_ENRICH, store);
      log.info(`checked ${checked}`, { network: http.stats.network });
    }
  }
  await writeJson(FDA_ENRICH, Object.fromEntries(Object.entries(store).sort()));
  const c = (s: string) => Object.values(store).filter((e) => e.status === s).length;
  log.info('enrich-fda done', {
    checked_total: Object.keys(store).length,
    match: c('match'),
    variants: c('match-variants'),
    ambiguous: c('ambiguous'),
    none: c('none'),
    skipped: c('skipped'),
    network: http.stats.network,
  });
  // Review list for ambiguous results.
  const rows = Object.entries(store)
    .filter(([, e]) => e.status === 'ambiguous')
    .map(([id, e]) => [
      id,
      e.candidates
        .map((c) => `${c.catalogue_no}: ${c.brand_name} — ${c.description}`.replace(/[\n,]/g, ' '))
        .join(' | '),
    ]);
  await mkdir(join(ROOT, 'docs'), { recursive: true });
  await writeFile(
    join(ROOT, 'docs', 'catalogue-review.csv'),
    [
      'product_id,fda_candidates',
      ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')),
    ].join('\n') + '\n',
    'utf8',
  );
}

const commands: Record<string, () => Promise<void>> = {
  crawl: cmdCrawl,
  parse: cmdParse,
  'build-data': cmdBuildData,
  validate: cmdValidate,
  'privacy-check': async () => void (await cmdPrivacyCheck()),
  audit: cmdAudit,
  'enrich-fda': cmdEnrichFda,
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
