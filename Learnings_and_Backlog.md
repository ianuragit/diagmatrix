# Learnings and Backlog

## Learnings
- 2026-11-24 — Source A's CDN firewall blocks a client after ~140 requests at 1 req/s and then answers 403 to everything. The crawler originally kept going and cached the 403s; it now stops at the first sustained block and never caches 401/403.
- 2026-11-24 — Source A pages embed the full ~3,200-link nav, so every page is ~1 MB; Brotli q9 caches them at ~150 KB.
- 2026-11-24 — Source A's robots.txt puts its shared Disallow list under the last named Google bot; strict RFC parsing would leave `*` allow-all. We honour all Disallow lines when no group names us.
- 2026-11-24 — Source A's spec lists contain platform filler ("Wall Mounted: No", "Noise Level: Silent Operation", "Weight: Lightweight") and sometimes contradict the fact table; the fact table (Brand / Sample Type / Pack Size / CAT No) is more reliable. Brand in the fact table can be wrong too (an ELISA kit named for one maker, labelled with another).
- 2026-11-24 — Source A product names sometimes lose characters at source ("1000 l" for 1000 µl).
- 2026-11-24 — A few source pages answer HTTP 500 consistently; they are logged as crawl failures, not retried forever.
- 2026-11-24 — Node's built-in `fetch` ignores `HTTPS_PROXY` unless `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21).
- 2026-11-24 — `Response.clone()` tees the body; cancelling only one branch never resolves. Don't clone in fakes.
- 2026-11-24 — Zod 4: use `z.url()`; `z.string().url()` is deprecated.

## Backlog
- 2026-11-24 — Finish Source A crawl (3,093 pages) — needs a decision: slower rate later, permission/feed from the owner, or stop at 141.
- 2026-11-24 — Normalise: drop platform filler spec keys; prefer fact-table values; fix "µ" loss (e.g. "1000 l" → "1000 µL").
- 2026-11-24 — Decide scope: Source A also lists surgical devices, lab equipment and life-science instruments (not IVD).
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
