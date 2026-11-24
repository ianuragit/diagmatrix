# Activity Summary Log

Newest first.

## 2026-11-24 — Phase 1: scaffold, tooling, CI skeleton

**Done**
- pnpm project (Node ≥ 22.12), Astro 7, Zod 4, Vitest 5, TypeScript 6 (strictest), Prettier, cheerio, Pagefind.
- `pipeline/core`: Zod schema + adapter contract (`types.ts`), polite HTTP client (`http.ts` + `robots.ts`),
  config loaders with placeholder guard, adapter registry driven only by `sources.yaml`, stable id allocator, logger.
- `pipeline/cli.ts` with `crawl`, `parse`, `validate`, `report` working generically; `build-data` stubbed for Phase 4.
- Source `_template` + stub `saaskin`/`diagnoodle` adapters; initial `brands.yaml`, `taxonomy.yaml`, `overrides.yaml`.
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
