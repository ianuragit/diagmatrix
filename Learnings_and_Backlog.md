# Learnings and Backlog

## Learnings
- 2026-11-25 — Astro 7 `astro preview` daemonises by default; Playwright's webServer needs `--ignore-lock` (foreground).
- 2026-11-25 — Build-time file reads in Astro pages must use project-root paths (`process.cwd()`), not `import.meta.url` — pages are bundled into `dist/.prerender`.
- 2026-11-25 — Source B lists the same assay under each compatible instrument with a different child id; treating those as duplicates produced 230 false groups. They are one product with several parents.
- 2026-11-25 — YAML flow mappings split on commas: a label like `Blood gases (pH, pO2, pCO2)` must be quoted.
- 2026-11-25 — Brand names that are ordinary words ("Human") or generic line names ("ULTRA") cause false brand matches from product names; mark them `stated_only` / don't list them as lines.
- 2026-11-25 — On urine strips, "erythrocytes/leukocytes/haemoglobin" are strip pads; in a urine-only context they map to urine chemistry, not a blood count.
- 2026-11-25 — Source B is a German POCT directory (Nuxt SSR). Each page embeds the full product record in `__NUXT_DATA__` (devalue-flattened JSON): manufacturer, categories, typed attributes with units, child tests/consumables, related products, document links. Reading that beats scraping prose. Attribute values are German ("Blut", "Urin", "Abstrich", "Schnelltest") — normalise must map them.
- 2026-11-25 — Source B's robots.txt bans a list of named bots with `Disallow: /`. The conservative robots rule must not borrow such blanket bans (it did; fixed and tested).
- 2026-11-25 — Source B's "manufacturer" is sometimes the OEM rather than the marketing brand (a coagulation meter sold by a large diagnostics company is listed under its OEM). Brand reconciliation in Phase 4.
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
- 2026-11-25 — Configure the inquiry form (Web3Forms/Formspree key) and WhatsApp number when ready — config only.
- 2026-11-25 — Product names from Source B are often German ("Harnstoff (BUN), Kreatinin und eGFR", "PSA gesamt"); consider an English display-name map for common terms.
- 2026-11-25 — 53 products still have no analyte (niche markers: mutation panels, TDM, AMR genes) and 9 are low-confidence; review via `pnpm report` and fix with taxonomy keywords or overrides.
- 2026-11-25 — Brand ownership questions for a human: LumiraDx (now Roche?), Xprecia (Siemens vs OEM Universal Biosensors), Calbiotech vs InBios.
- 2026-11-25 — Pack size (8%) and catalogue no (9%) are sparse: Source B publishes neither. Hand-added data or a third source would help.
- 2026-11-25 — Source A: 3,093 pages not fetched (site firewall). Revisit only with owner permission or a much slower rate.
- 2026-11-24 — Phase 2: `src-a` selectors + adapter + scrubbed fixtures.
- 2026-11-24 — Set `contact_email` (User-Agent) and `whatsapp_number` when available.
- 2026-11-24 — Phases 6–7: SEO/GEO, Lighthouse, deploy, docs.
- 2026-11-24 — `--download-images` flag is parsed but not yet wired (Phase 4/5).

## Implemented
- 2026-11-25 — Phase 4 normalise/enrich/dedupe; frozen sources; manual products.
- 2026-11-25 — Phase 3 Source B adapter (sitemap + Nuxt payload) with scrubbed fixtures.
- 2026-11-24 — Privacy layer: neutral source ids, local-only URLs/provenance, privacy-check + hook.
- 2026-11-24 — Polite HTTP client with robots, throttle, retry, disk cache, offline/refresh modes.
- 2026-11-24 — Source registry + `_template`; extensibility test.
