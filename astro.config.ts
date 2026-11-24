import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

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

export default defineConfig({
  site: siteUrl.origin,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
});
