# diagmatrix

A static directory of in-vitro diagnostic products. A polite scraping pipeline
(robots.txt-first, 1 req/s per host, disk-cached) builds `data/products.json`;
Astro renders it to GitHub Pages.

> Status: Phase 1 (scaffold). See `Activity_Summary_Log.md`.

## Setup

Requires Node ≥ 22.12 and pnpm 10.

```bash
pnpm install
```

1. Review `project.config.yaml` (site name, URL, form, WhatsApp, contact email).
2. `cp pipeline/config/sources.local.example.yaml pipeline/config/sources.local.yaml` and put
   the real source base URLs and any private terms in it. This file is git-ignored.
3. `git config core.hooksPath .githooks` to enable the privacy pre-commit hook.

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
| `pnpm crawl` | Discover product URLs for every enabled source and fetch them into `.cache/http/`. Cached URLs are not re-fetched. Flags: `--source a,b`, `--refresh` (conditional revalidation), `--offline` (cache only), `--discover-only`, `--limit N`. |
| `pnpm parse` | Turn cached pages into `data/raw/{source}/products/*.json`. Never uses the network. |
| `pnpm build-data` | Normalise, enrich, dedupe, merge → `data/products.json` + `data/duplicates.json`. *(Phase 4)* |
| `pnpm validate` | Schema-check `data/products.json`; fails on errors or duplicate slugs. |
| `pnpm report` | Counts per source/category (more in Phase 4). |
| `pnpm privacy-check` | Scan committable files and `dist/` for private terms. |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Astro site; `build` also runs Pagefind. |
| `pnpm test` / `pnpm typecheck` | Vitest; `tsc` + `astro check`. |

Behind an HTTP proxy, run the crawler with `NODE_USE_ENV_PROXY=1`.

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

*(Format finalised in Phase 4.)* Create `data/manual/<anything>.yaml` with one or more
products (name, brand, catalogue_no, specs, …) and run `pnpm build-data`. Manual
records go through the same normalisation and take precedence over scraped ones.
