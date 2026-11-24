# Source adapter template

1. `cp -r pipeline/sources/_template pipeline/sources/<id>` (id: lowercase, `[a-z0-9_-]`).
2. Add `{ id, baseUrl, enabled: true, priority }` to `pipeline/config/sources.yaml`.
3. `pnpm crawl --source <id> --discover-only` to cache the entry page(s), then open
   the cached HTML under `.cache/http/<host>/` and write `selectors.ts`, quoting the
   snippet each selector targets.
4. Implement `discover()` (via `ctx.get` only) and `parseProduct()` (pure function).
5. Copy 3–5 varied product pages into `fixtures/` and write `adapter.test.ts`.
6. `pnpm crawl --source <id> && pnpm parse --source <id>`.

No changes are needed in `pipeline/core`, `pipeline/normalise` or `src/`.
