# Index

Every folder and key file, mirroring the tree. Keep current.

| Path | Purpose |
|---|---|
| `project.config.yaml` | Project-wide settings (site name/URL, form, WhatsApp, contact email, AI-crawler flag). No source URLs. |
| `astro.config.ts` | Astro config; derives `site` + `base` from `site_url`; sitemap with noindex pages excluded. |
| `package.json` / `pnpm-lock.yaml` | Scripts (`crawl`, `parse`, `build-data`, `validate`, `report`, `privacy-check`, `build`, `test`, `typecheck`) and deps. |
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
| `pipeline/core/privacy.ts` | Privacy guard: no source names/hosts in tracked files or `dist/`. |
| `pipeline/core/*.test.ts` | Unit tests for the core (incl. registry extensibility proof). |
| `pipeline/sources/_template/` | Copy to add a source (adapter, selectors, README). |
| `pipeline/sources/src-a/` | Source A adapter (homepage-nav discovery, product parser), selectors with snippet comments, scrubbed fixtures, tests. |
| `pipeline/sources/src-b/` | Source B adapter (sitemap discovery, embedded Nuxt payload parser), `devalue.ts` payload decoder/encoder, selectors, scrubbed fixtures, tests. |
| `pipeline/normalise/brand.ts` | Brand split (prefix → product line → stated brand), conflicts reported. |
| `pipeline/normalise/classify.ts` | Technology / analyte / sample / product-type classification + scope filter, from taxonomy.yaml. |
| `pipeline/normalise/packsize.ts` | Pack-size parsing and stripping from names. |
| `pipeline/normalise/dedupe.ts` | Normalised dedupe key + grouping. |
| `pipeline/normalise/merge.ts` | build-data core: components, scope, merge by priority, duplicates, stable ids, related, overrides. |
| `pipeline/normalise/summary.ts` | Factual summaries generated only from normalised fields. |
| `pipeline/normalise/*.test.ts` | Unit tests incl. an end-to-end `build()` test with synthetic records. |
| `pipeline/config/sources.yaml` | Source registry with neutral ids (id, enabled, priority). |
| `pipeline/config/sources.local.example.yaml` | Template for the git-ignored `sources.local.yaml` (real base URLs + private terms). |
| `pipeline/config/brands.yaml` | 101 canonical brands, aliases, product-line → brand, `stated_only` and OEM flags. |
| `pipeline/config/taxonomy.yaml` | Categories, technologies, 129 analytes, 15 technologies, sample types, product types, spec filters, EN/DE translations, text fixes, scope rules. |
| `pipeline/config/overrides.yaml` | Per-id manual corrections applied last. |
| `data/raw/{source}/` (git-ignored) | `nav.json`, `products/*.json`, `parse-failures.json` per source. |
| `data/private/` (git-ignored) | `provenance.json` (source URLs/ids per product), `build-report.json`. Never published. |
| `data/id-map.json` | Stable product ids keyed by hashed source refs. |
| `data/manual/` | Hand-added products (`*.yaml`), a first-class source; `example.yaml.sample` shows the format. |
| `data/products.json` | Final public catalogue (canonical + flagged duplicates). |
| `data/duplicates.json` | Duplicate groups (same source) and cross-source merges, by public id. |
| `src/content.config.ts` | Content collection over `data/products.json`, validated with the pipeline's `ProductSchema`. |
| `src/lib/` | `url.ts` (the one link helper), `site.ts` (project config, form/WhatsApp switches, disclaimer), `catalogue.ts` (collection, taxonomy labels, groupings). |
| `src/layouts/Base.astro` | Page shell: head, header, footer, inquiry modal, client script init. |
| `src/components/` | Header (search, basket badge), Footer (disclaimer), InquiryModal, RequestInfo (all CTA variants), AddToQuote, WhatsAppLink, ProductCard, ProductImage (placeholder), Breadcrumbs (+ JSON-LD), Pagination, Listing (static list + facet island), HubLayout. |
| `src/scripts/` | Client code: `basket.ts` (quote_basket_v1), `inquiry.ts` (modal, validation, request_info event, Web3Forms/Formspree), `search.ts` (Pagefind), `facets.ts` (filters with URL state), `forms.ts` (shared validation + Web3Forms/Formspree submit). |
| `src/pages/` | Home; `/products/` (paginated) + `/products/{slug}/`; `/categories/{cat}/[{sub}/]`; `/brands/`; `/analytes/`; `/technology/`; `/search/`; `/basket/`; `/contact/`; `/about/`; 404; `/data/facets.json`. |
| `src/lib/seo.ts` | Absolute URLs + JSON-LD builders (Product, ItemList, Organization, WebSite/SearchAction). |
| `src/lib/og.ts` | Build-time Open Graph card renderer (SVG → PNG with resvg). |
| `src/pages/og/` | `/og/{slug}.png` per product + `/og/default.png`. |
| `src/pages/robots.txt.ts`, `llms.txt.ts`, `llms-full.txt.ts` | robots (AI-crawler flag), LLM site summary, per-product text list. |
| `src/pages/data/products.json.ts`, `src/pages/products/[slug].json.ts` | Public catalogue JSON and per-product JSON twins. |
| `src/styles/` | `tokens.css` (design tokens), `global.css` (base, buttons, cards, listing/facets). |
| `playwright.config.ts`, `tests/e2e/` | Browser smoke tests against the built site under the real base path. |
| `public/` | Static files (`.nojekyll`, later robots.txt, fonts). |
| `.github/workflows/deploy.yml` | Push to main → test → validate → build → Pages. |
| `.github/workflows/ci.yml` | Typecheck, test, validate, build on PRs/branches. |
| `.github/workflows/data-refresh.yml` | Manual re-crawl that opens a data PR. |
| `.cache/http/` (git-ignored) | HTTP response cache: `{sha1(url)}.html.br` (Brotli) + `.meta.json`. |
| `scripts/linkcheck.ts` | Offline link + anchor checker for `dist/`. |
| `docs/catalogue-report.md` | Latest `pnpm report` output (no source URLs/ids). |
| `scripts/make-fixture.ts` | Builds scrubbed, trimmed HTML fixtures from the cache (no network). |
| `scripts/make-fixture-nuxt.ts` | Builds scrubbed fixtures for Nuxt-payload sources (trimmed payload, fake ids, sitemap pair). |
| `scripts/fetch.ts` | Dev helper: fetch URLs through the polite cached client. |
| `scripts/scratch/` (git-ignored) | Throwaway inspection scripts. |
| `.githooks/pre-commit` | Runs `pnpm privacy-check`; enable with `git config core.hooksPath .githooks`. |
