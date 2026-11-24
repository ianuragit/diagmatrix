# Index

Every folder and key file, mirroring the tree. Keep current.

| Path | Purpose |
|---|---|
| `project.config.yaml` | Project-wide settings (site name/URL, form, WhatsApp, contact email, AI-crawler flag). Read by pipeline and Astro. |
| `astro.config.ts` | Astro config; derives `site` + `base` from `site_url`. |
| `package.json` / `pnpm-lock.yaml` | Scripts (`crawl`, `parse`, `build-data`, `validate`, `report`, `build`, `test`, `typecheck`) and deps. |
| `tsconfig.json` | Strictest TS config (extends `astro/tsconfigs/strictest`). |
| `vitest.config.ts` | Unit test config. |
| `pipeline/cli.ts` | CLI entry: `crawl \| parse \| build-data \| validate \| report`. |
| `pipeline/core/types.ts` | Zod schemas (NavEntry, RawProduct, Product, SourceConfig) + `SourceAdapter` interface. Single source of truth. |
| `pipeline/core/http.ts` | Polite HTTP client: robots-first, 1 req/s/host throttle, retry/backoff, disk cache, UA with contact. |
| `pipeline/core/robots.ts` | robots.txt parser (RFC 9309). |
| `pipeline/core/config.ts` | YAML config loaders + placeholder guard. |
| `pipeline/core/registry.ts` | Loads adapters listed in `sources.yaml` from `pipeline/sources/{id}/adapter.ts`. |
| `pipeline/core/slug.ts` | `slugify`, hashes, stable id allocator. |
| `pipeline/core/log.ts` | Structured logger. |
| `pipeline/core/*.test.ts` | Unit tests for the core (incl. registry extensibility proof). |
| `pipeline/sources/_template/` | Copy to add a source (adapter, selectors, README). |
| `pipeline/sources/saaskin/` | Saaskin adapter, selectors, fixtures (Phase 2). |
| `pipeline/sources/diagnoodle/` | Diagnoodle adapter, selectors, fixtures (Phase 3). |
| `pipeline/normalise/` | brand / classify / packsize / dedupe / merge (Phase 4). |
| `pipeline/config/sources.yaml` | Source registry (id, baseUrl, enabled, priority). |
| `pipeline/config/brands.yaml` | Canonical brands, aliases, product-line → brand. |
| `pipeline/config/taxonomy.yaml` | Shared categories, technology/analyte/sample/product-type keywords. |
| `pipeline/config/overrides.yaml` | Per-id manual corrections applied last. |
| `data/raw/{source}/` | `nav.json`, `products/*.json`, `parse-failures.json` per source. |
| `data/manual/` | Hand-added products (`*.yaml`), a first-class source. |
| `data/products.json` | Final merged catalogue (Phase 4). |
| `data/duplicates.json` | Flagged duplicate groups (Phase 4). |
| `src/` | Astro site: `pages/`, `layouts/`, `components/`, `styles/`, `lib/url.ts` (the one link helper). |
| `public/` | Static files (`.nojekyll`, later robots.txt, fonts). |
| `.github/workflows/deploy.yml` | Push to main → test → validate → build → Pages. |
| `.github/workflows/ci.yml` | Typecheck, test, validate, build on PRs/branches. |
| `.github/workflows/data-refresh.yml` | Manual re-crawl that opens a data PR. |
| `.cache/http/` (git-ignored) | HTTP response cache. |
