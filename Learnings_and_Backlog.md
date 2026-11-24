# Learnings and Backlog

## Learnings
- 2026-11-24 — Node's built-in `fetch` ignores `HTTPS_PROXY` unless `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21).
- 2026-11-24 — `Response.clone()` tees the body; cancelling only one branch never resolves. Don't clone in fakes.
- 2026-11-24 — Zod 4: use `z.url()`; `z.string().url()` is deprecated.

## Backlog
- 2026-11-24 — Phase 2: `src-a` selectors + adapter + scrubbed fixtures.
- 2026-11-24 — Phase 3: `src-b` adapter (base URL to be put in sources.local.yaml).
- 2026-11-24 — Set `contact_email` (User-Agent) and `whatsapp_number` when available.
- 2026-11-24 — Phase 4: normalise/enrich/dedupe, `build-data`.
- 2026-11-24 — Phases 5–7: site, SEO/GEO, Playwright + Lighthouse + docs.
- 2026-11-24 — `--download-images` flag is parsed but not yet wired (Phase 4/5).

## Implemented
- 2026-11-24 — Privacy layer: neutral source ids, local-only URLs/provenance, privacy-check + hook.
- 2026-11-24 — Polite HTTP client with robots, throttle, retry, disk cache, offline/refresh modes.
- 2026-11-24 — Source registry + `_template`; extensibility test.
