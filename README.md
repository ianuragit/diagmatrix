# diagmatrix

A static directory of in-vitro diagnostic products. A polite scraping pipeline
(robots.txt-first, 1 req/s per host, disk-cached) builds `data/products.json`;
Astro renders it to GitHub Pages.

> Status: Phase 6 done (SEO/GEO: JSON-LD, OG images, sitemap, robots, llms.txt, JSON endpoints). See `Activity_Summary_Log.md`.

## Setup

Requires Node ≥ 22.12 and pnpm 10.

```bash
pnpm install
```

1. Review `project.config.yaml` (site name, URL, form, WhatsApp, contact email).
2. `cp pipeline/config/sources.local.example.yaml pipeline/config/sources.local.yaml` and put
   the real source base URLs and any private terms in it. This file is git-ignored.
3. `git config core.hooksPath .githooks` to enable the privacy pre-commit hook.

## Switching on the inquiry form and WhatsApp

Edit `project.config.yaml` and rebuild — no code changes:

```yaml
form:
  service: web3forms        # or formspree
  key: "<public access key>" # Formspree: the full https://formspree.io/f/... endpoint
whatsapp_number: "919800000000"
```

## Open TODOs

Things deliberately left unset for now — fill in before launch.

| Item | Where | Effect while unset |
|---|---|---|
| Contact email | `project.config.yaml → contact_email` | Crawler User-Agent carries no contact address; site contact page has no email. |
| WhatsApp number | `project.config.yaml → whatsapp_number` | WhatsApp buttons hidden. |
| Site URL | `project.config.yaml → site_url` | Falls back to `https://ianuragit.github.io/diagmatrix`. |
| Form service + key | `project.config.yaml → form` | Inquiry form disabled. |
| Source B base URL | `sources.local.yaml → sources.src-b.baseUrl` | Source B skipped. |
| CI source URLs | repo secrets `SOURCE_SRC_A_URL`, `SOURCE_SRC_B_URL` | `data-refresh` workflow skips those sources. |

## Privacy rules

- Source names and hosts never appear in the repo or the site. Sources have neutral ids
  (`src-a`, `src-b`); their URLs live only in the git-ignored `sources.local.yaml`.
- Public data (`data/products.json`) carries no source URLs, record ids or item codes.
  `catalogue_no` is the manufacturer's REF only. Provenance stays in git-ignored `data/private/`.
- Raw scraped records (`data/raw/*/`) and the HTTP cache are git-ignored.
- Committed HTML fixtures are scrubbed of names, hosts, phone numbers and emails.
- `pnpm privacy-check` (also part of `pnpm validate` and the pre-commit hook) fails if any
  private term or source hostname appears in a file git would commit or in `dist/`.

## Commands

| Command | What it does |
|---|---|
| `pnpm crawl` | Discover product URLs for every enabled source and fetch them into `.cache/http/`. Cached URLs are not re-fetched; `frozen` sources never touch the network. Stops a source at the first sustained block (401/403/429). Flags: `--source a,b`, `--refresh` (conditional revalidation), `--offline` (cache only), `--discover-only`, `--limit N`. |
| `pnpm parse` | Turn cached pages into `data/raw/{source}/products/*.json`. Never uses the network. |
| `pnpm build-data` | Normalise, classify, dedupe, merge (+ `data/manual/*.yaml`) → `data/products.json`, `data/duplicates.json`, `data/id-map.json`; private provenance and build report in `data/private/`. No network. |
| `pnpm validate` | Schema-check `data/products.json`; fails on errors or duplicate slugs. |
| `pnpm report` | Markdown report: raw counts and coverage per source; catalogue brand table, categories, field coverage, duplicate groups, merges, scope drops, brand conflicts, low-confidence items. Never prints source URLs or ids. |
| `pnpm privacy-check` | Scan committable files and `dist/` for private terms. |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Astro site; `build` also runs Pagefind. |
| `pnpm test` / `pnpm typecheck` | Vitest; `tsc` + `astro check`. |
| `pnpm test:e2e` | Playwright smoke tests against the built site (run `pnpm build` first). |

Behind an HTTP proxy, run the crawler with `NODE_USE_ENV_PROXY=1`.

Cached pages are stored Brotli-compressed (`.cache/http/{host}/{sha1(url)}.html.br`)
next to a `.meta.json` with url, status, fetched_at and etag.

To refresh test fixtures from the cache (scrubbed automatically):

```bash
pnpm exec tsx scripts/make-fixture.ts src-a nav=<homepage-url> rapid-test=<product-url> ...
```

## How to add a new source

1. `cp -r pipeline/sources/_template pipeline/sources/<id>`
2. Add to `pipeline/config/sources.yaml` (use a neutral id):
   ```yaml
   - id: <id>
     enabled: true
     priority: 30   # lower wins when merging fields
   ```
   and put its URL in `sources.local.yaml` under `sources.<id>.baseUrl` (plus the
   company name under `private_terms`).
3. `pnpm crawl --source <id> --discover-only`, inspect the cached HTML in `.cache/http/<host>/`,
   and write `selectors.ts` with a comment quoting the snippet each selector targets.
4. Implement `discover()` (use `ctx.get`, never `fetch`) and `parseProduct()` (pure).
5. Save 3–5 varied pages to `fixtures/` **scrubbed** (see Privacy rules) and add `adapter.test.ts`.
6. `pnpm crawl --source <id> && pnpm parse --source <id> && pnpm build-data`.

Nothing in `pipeline/core`, `pipeline/normalise` or `src/` changes.

## How to add a product by hand

1. `cp data/manual/example.yaml.sample data/manual/<anything>.yaml`
2. Fill in what you know — only `name` is required. Leave unknown fields out; never guess.
3. If the brand is new, add it to `pipeline/config/brands.yaml` (canonical name, aliases, product lines).
4. `pnpm build-data && pnpm validate`, then check the product in `pnpm report`.

Manual products go through the same brand split, pack-size parsing and classification
as scraped ones, and win over scraped values field by field.

## How the catalogue is built (`pnpm build-data`)

1. **Text fixes** (`taxonomy.yaml → text_fixes`): fused tokens and typos in names.
2. **Components**: an instrument page's child tests/strips become their own products,
   linked both ways; the same assay listed under several instruments becomes one product.
3. **Scope**: diagnostics only (`taxonomy.yaml → scope`); every dropped record is reported.
4. **Brand** (`brands.yaml`): name prefix → product line → stated brand. Name wins; conflicts are reported.
5. **Pack size** from the fact table or the name; stripped from the name.
6. **Classification** (`taxonomy.yaml`): technology, analytes, sample types, product type/subtype,
   category (from technology) and subcategory (from product type), with a confidence score.
7. **Public specs**: platform filler and commercial terms dropped, German keys/values translated,
   fact-table values beat spec lists.
8. **Dedupe/merge**: same brand + normalised name key. Within a source → duplicates (flagged,
   `duplicate_of`, kept for redirects). Across sources → one product, fields by source priority.
   Different manufacturer catalogue numbers are never merged.
9. **Stable ids**: `{brand}-{name}` slug, persisted in `data/id-map.json` (keys are hashes, not source ids).
10. **Related** (max 8): parent instrument ↔ tests, source-linked products, same product line,
    same analyte from other brands.
11. **Summary**: 1–3 sentences generated only from the fields above.
12. **Overrides** (`overrides.yaml`), applied last.

## SEO / GEO outputs

| URL | What |
|---|---|
| `/sitemap-index.xml` | Sitemap of indexable pages only |
| `/robots.txt` | Crawl rules; AI crawlers allowed/blocked by `allow_ai_crawlers` (effective at a host root) |
| `/llms.txt`, `/llms-full.txt` | Site summary and per-product facts for LLMs |
| `/data/products.json`, `/products/{slug}.json` | Public machine-readable catalogue |
| `/og/{slug}.png` | Generated social card per product |

## Frozen sources

A source with `frozen: true` (in `sources.yaml` or `sources.local.yaml`) is crawled from cache only.
`src-a` is frozen: its site firewall blocks crawling, so we keep the pages already cached.
