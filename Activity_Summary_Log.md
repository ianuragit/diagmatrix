# Activity Summary Log

Newest first.

## 2026-11-25 — Phase 4: normalise, enrich, dedupe → data/products.json

**Done**
- `pipeline/normalise/`: `brand.ts`, `classify.ts`, `packsize.ts`, `dedupe.ts`, `summary.ts`, `merge.ts` (the
  build-data core), each with tests; an end-to-end `build()` test on synthetic records.
- `taxonomy.yaml` rewritten: 11 categories (from technology), product-type subcategories, 15 technologies,
  129 analytes and 12 sample types with English + German synonyms, spec filters, key/value translations,
  text fixes, scope rules. `brands.yaml`: 101 brands with aliases, product lines, `stated_only`, OEM list.
- `build-data` writes `data/products.json`, `data/duplicates.json`, `data/id-map.json` (public) and
  `data/private/{provenance,build-report}.json` (git-ignored). `report` gained the catalogue section.
- `frozen` source flag; `src-a` frozen → a full `pnpm crawl` makes zero network requests.
- `data/manual/example.yaml.sample` documents hand-added products.

**Outcome**: 1,226 records — 1,219 canonical + 7 flagged duplicates (6 groups); 13 cross-source merges;
1,329 instrument child tests expanded into own products. Coverage: brand 100%, technology 98.9%,
analyte 95.7%, sample type 95.0%, product type 99.6%, summary 100%, related 98.6%, pack size 7.9%,
catalogue no 8.7%. 9 low-confidence items. Build is deterministic (byte-identical on re-run). 75 tests green.

**Decisions**
- Components: same assay under several instruments = one product linked to all of them, not duplicates.
- Fact-table sample type beats the spec list outright (the spec list is filler-prone).
- Name-derived brand beats stated brand; 4 disagreements reported (Calbiotech/InBios, LumiraDx/Roche,
  Xprecia ×2 OEM). Product lines that are ordinary words are not used (ULTRA removed; `Human` is stated-only).
- Different manufacturer catalogue numbers are never merged.
- Public documents: manufacturer manuals/datasheets/brochures/IFUs only; source-hosted files, the source's
  curated study lists and videos stay private.
- id map reset once before first publication (exploratory runs had baked in early brand mistakes).

## 2026-11-25 — Phase 3: Source B ingestion

**Done**
- Source B identified (German POCT directory, Nuxt SSR). robots.txt + sitemap index → 304 product URLs.
- `src-b` adapter reads the embedded `__NUXT_DATA__` product record via a small devalue decoder
  (`devalue.ts`, with an encoder for fixtures): manufacturer, categories, typed attributes with units,
  child tests (`components`), related product ids, document links.
- RawProduct gained `components` and `related_source_ids`.
- `scripts/make-fixture-nuxt.ts`: trimmed, id-remapped, scrubbed payload fixtures (3–13 KB) + sitemap pair.
- robots fix: never borrow another group's blanket `Disallow: /` (Source B bans named bad bots that way).
- Crawl: 304/304 fetched at 1 req/s (~2 s/page server time), 0 failures, no blocks; 303 parsed
  (1 page had no product record).

## 2026-11-25 — Decisions after Phase 2

- Source A: stop at the 141 records fetched (option c); remaining pages stay a backlog item.
- Scope: diagnostics only. `taxonomy.yaml → scope` excludes Source A's LAB, Accessories, Surgicals and
  Life Sciences categories and adds keyword rules for non-diagnostic items in kept categories; applied in
  build-data (Phase 4) with dropped records listed in the report. Added CLIA, analyzer, reagent and
  consumable categories to the shared taxonomy.
- Phase 3 is waiting on Source B's homepage URL (a web search could not identify it).

## 2026-11-24 — Phase 2: Source A ingestion (partial — blocked by site firewall)

**Done**
- `src-a` adapter: discovery from the homepage nav (13 categories, 3,234 unique products, no overlap;
  category pages verified to add nothing, no pagination). Product parser: name, breadcrumb category,
  "Product Specifications" rows, "Product Details" rows, description fact table (brand, sample type,
  pack size, CAT No), main image, PDF links; commercial blocks skipped.
- Scrubbed, trimmed fixtures for nav + rapid test, ELISA, analyser, consumable, control; 8 adapter tests.
- Crawl: 141 product pages fetched, then the site's CDN firewall returned "Request blocked" (403) for
  every further request (from the ~141st request at 1 req/s).
- Fixes after the block: 401/403 never cached and never retried; after 3 consecutive blocks the host is
  marked blocked and all further requests fail fast with zero traffic; crawl stops that source.
  Per-source `minIntervalMs` (sources.yaml / sources.local.yaml). Cached 403s deleted.
- Report command prints categories, field coverage, fact keys, sample records, parse failures — never
  URLs or record ids.

**Outcome**: 141 / 3,234 raw records (IVD 82/82, RDT 55/150, 1 each of 4 others). Waiting on a decision
about how (or whether) to continue crawling Source A.

## 2026-11-24 — Privacy restructure (before Phase 2)

**Done**
- Sources renamed to neutral ids `src-a` / `src-b`; real base URLs moved to git-ignored
  `pipeline/config/sources.local.yaml` (or env `SOURCE_<ID>_URL` in CI).
- Public schema no longer carries source names, URLs, record ids, item codes or source-hosted
  images; provenance moves to git-ignored `data/private/`. Added `source_count`, removed `image`/`sources`.
- `data/raw/*/` git-ignored. New `privacy-check` command (also run by `validate`) and pre-commit hook.
- User-Agent is now generic (`CatalogueIndexerBot/0.1 …`); contact email appended once set.
- `site_name` = diagmatrix; contact email / WhatsApp left empty (README → Open TODOs).

**Decisions**
- `catalogue_no` holds the manufacturer's REF only, never a distributor's own item code.
- Product ids/slugs derive from brand + name; the id map is keyed by a hash, not a source id.
- HTML fixtures are committed only after scrubbing (names, hosts, phones, emails).

## 2026-11-24 — Phase 1: scaffold, tooling, CI skeleton

**Done**
- pnpm project (Node ≥ 22.12), Astro 7, Zod 4, Vitest 5, TypeScript 6 (strictest), Prettier, cheerio, Pagefind.
- `pipeline/core`: Zod schema + adapter contract (`types.ts`), polite HTTP client (`http.ts` + `robots.ts`),
  config loaders with placeholder guard, adapter registry driven only by `sources.yaml`, stable id allocator, logger.
- `pipeline/cli.ts` with `crawl`, `parse`, `validate`, `report` working generically; `build-data` stubbed for Phase 4.
- Source `_template` + two stub source adapters; initial `brands.yaml`, `taxonomy.yaml`, `overrides.yaml`.
- Minimal Astro site with base-path-aware `url()` helper; builds.
- Workflows: `deploy.yml`, `ci.yml`, `data-refresh.yml` (manual).
- 13 unit tests: robots parsing, throttle ≥1 s, Crawl-delay, retry/backoff (max 3), cache → zero network on rerun,
  offline mode, conditional refresh, UA guard, slug/id stability, third-source extensibility.

**Decisions**
- Node 22 instead of 20: Astro 7 and Vitest 5 require Node ≥ 22.12.
- TypeScript 6 (not 7): `@astrojs/check` supports TS ≤ 6.
- Adapter contract: `discover(ctx)` receives the polite HTTP client (adapters never fetch directly);
  `parseProduct(html, entry)` is pure and returns the record without `fetched_at`, which the CLI stamps from cache metadata.
- Cache policy: a cached URL is never re-fetched without `--refresh`; uncached URLs are fetched unless `--offline`.
  4xx responses are cached too, so reruns make zero requests. Unreachable robots.txt ⇒ host fully disallowed (RFC 9309).
- Hand-added products (`data/manual`) are not in `sources.yaml`; they always load and always win precedence.

**Outcome**: `pnpm typecheck`, `pnpm test`, `pnpm build` all green.
