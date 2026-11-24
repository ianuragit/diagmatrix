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

Fill in `project.config.yaml` (the crawler refuses to run without `contact_email`,
which goes into its User-Agent).

## Commands

| Command | What it does |
|---|---|
| `pnpm crawl` | Discover product URLs for every enabled source and fetch them into `.cache/http/`. Cached URLs are not re-fetched. Flags: `--source a,b`, `--refresh` (conditional revalidation), `--offline` (cache only), `--discover-only`, `--limit N`. |
| `pnpm parse` | Turn cached pages into `data/raw/{source}/products/*.json`. Never uses the network. |
| `pnpm build-data` | Normalise, enrich, dedupe, merge → `data/products.json` + `data/duplicates.json`. *(Phase 4)* |
| `pnpm validate` | Schema-check `data/products.json`; fails on errors or duplicate slugs. |
| `pnpm report` | Counts per source/category (more in Phase 4). |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Astro site; `build` also runs Pagefind. |
| `pnpm test` / `pnpm typecheck` | Vitest; `tsc` + `astro check`. |

Behind an HTTP proxy, run the crawler with `NODE_USE_ENV_PROXY=1`.

## How to add a new source

1. `cp -r pipeline/sources/_template pipeline/sources/<id>`
2. Add to `pipeline/config/sources.yaml`:
   ```yaml
   - id: <id>
     baseUrl: https://example.com
     enabled: true
     priority: 30   # lower wins when merging fields
   ```
3. `pnpm crawl --source <id> --discover-only`, inspect the cached HTML in `.cache/http/<host>/`,
   and write `selectors.ts` with a comment quoting the snippet each selector targets.
4. Implement `discover()` (use `ctx.get`, never `fetch`) and `parseProduct()` (pure).
5. Save 3–5 varied pages to `fixtures/` and add `adapter.test.ts`.
6. `pnpm crawl --source <id> && pnpm parse --source <id> && pnpm build-data`.

Nothing in `pipeline/core`, `pipeline/normalise` or `src/` changes.

## How to add a product by hand

*(Format finalised in Phase 4.)* Create `data/manual/<anything>.yaml` with one or more
products (name, brand, catalogue_no, specs, …) and run `pnpm build-data`. Manual
records go through the same normalisation and take precedence over scraped ones.
