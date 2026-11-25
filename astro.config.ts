import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { slugify } from './pipeline/core/slug.ts';

/**
 * `site` and `base` come from project.config.yaml → site_url, so the same build
 * works on a project page (https://user.github.io/repo/ → base "/repo") and on a
 * custom domain (base "/"). Until site_url is filled in we fall back to the
 * GitHub Pages URL implied by github_repo.
 */
const cfg = parse(readFileSync(new URL('./project.config.yaml', import.meta.url), 'utf8')) as {
  site_url: string;
  github_repo: string;
};
const [owner, repo] = cfg.github_repo.split('/');
const siteUrl = new URL(
  /\{\{/.test(cfg.site_url) ? `https://${owner}.github.io/${repo}` : cfg.site_url,
);
const base = siteUrl.pathname.replace(/\/+$/, '') || '/';

/** Paths that render with noindex must not be in the sitemap. Mirrors src/lib/catalogue.ts. */
function noindexPaths(): Set<string> {
  type P = {
    slug: string;
    duplicate_of: string | null;
    brand: string | null;
    category: string | null;
    subcategory: string | null;
    technology: string | null;
    analyte: string[];
  };
  const products = JSON.parse(
    readFileSync(new URL('./data/products.json', import.meta.url), 'utf8'),
  ) as P[];
  const live = products.filter((p) => !p.duplicate_of);
  const SUB: Record<string, string> = {
    instrument: 'instruments',
    reagent: 'tests-reagents',
    control: 'controls-calibrators',
    consumable: 'consumables',
  };
  const THIN = 3;
  const out = new Set<string>(
    products.filter((p) => p.duplicate_of).map((p) => `/products/${p.slug}/`),
  );
  const count = (key: (p: P) => (string | null)[], prefix: (k: string) => string) => {
    const m = new Map<string, number>();
    for (const p of live) for (const k of key(p)) if (k) m.set(k, (m.get(k) ?? 0) + 1);
    for (const [k, n] of m) if (n < THIN) out.add(prefix(k));
  };
  count(
    (p) => [p.category],
    (k) => `/categories/${k}/`,
  );
  count(
    (p) => [p.category && p.subcategory ? `${p.category}/${SUB[p.subcategory]}` : null],
    (k) => `/categories/${k}/`,
  );
  count(
    (p) => [p.brand ? slugify(p.brand) : null],
    (k) => `/brands/${k}/`,
  );
  count(
    (p) => p.analyte,
    (k) => `/analytes/${k}/`,
  );
  count(
    (p) => [p.technology],
    (k) => `/technology/${k}/`,
  );
  return out;
}
const excluded = noindexPaths();

export default defineConfig({
  site: siteUrl.origin,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.slice(base === '/' ? 0 : base.length);
        if (/^\/(search|basket)\/$/.test(path) || /\/404\/?$/.test(path)) return false;
        if (/\/\d+\/$/.test(path)) return false; // paginated pages 2+ are noindex
        return !excluded.has(path);
      },
    }),
  ],
});
