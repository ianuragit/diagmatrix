/**
 * Offline link check over the built site (dist/). Every internal href/src must
 * resolve to a file, and every #fragment to an id on the target page. External
 * links are counted, not fetched (no network in CI by design).
 *
 *   pnpm linkcheck            # after pnpm build
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { parse } from 'yaml';

const DIST = join(process.cwd(), 'dist');
const cfg = parse(readFileSync('project.config.yaml', 'utf8')) as {
  site_url: string;
  github_repo: string;
};
const siteUrl = new URL(
  /\{\{/.test(cfg.site_url) ? `https://x.github.io/${cfg.github_repo.split('/')[1]}` : cfg.site_url,
);
const base = siteUrl.pathname.replace(/\/?$/, '/');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

/** Map an absolute URL path under base to a dist file. */
function fileFor(path: string): string | null {
  if (!path.startsWith(base)) return null;
  const rel = decodeURIComponent(path.slice(base.length));
  const candidates = [join(DIST, rel), join(DIST, rel, 'index.html'), join(DIST, `${rel}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const idCache = new Map<string, Set<string>>();
function idsOf(file: string): Set<string> {
  let s = idCache.get(file);
  if (!s) {
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    s = new Set(
      $('[id]')
        .map((_, e) => $(e).attr('id')!)
        .get(),
    );
    idCache.set(file, s);
  }
  return s;
}

const pages = walk(DIST);
const broken: string[] = [];
let internal = 0;
let external = 0;
for (const page of pages) {
  const pagePath = base + page.slice(DIST.length + 1).replace(/index\.html$/, '');
  const $ = cheerio.load(readFileSync(page, 'utf8'));
  $('a[href], link[href], script[src], img[src]').each((_, el) => {
    const raw = $(el).attr('href') ?? $(el).attr('src') ?? '';
    if (!raw || /^(mailto:|tel:|javascript:|data:)/.test(raw)) return;
    // Skip dynamic templates in inline scripts and the WhatsApp/booking style links.
    const u = new URL(raw, new URL(pagePath, siteUrl.origin));
    if (u.origin !== siteUrl.origin) {
      external++;
      return;
    }
    internal++;
    const target = u.pathname === pagePath && raw.startsWith('#') ? page : fileFor(u.pathname);
    if (!target) {
      broken.push(`${pagePath} → ${raw}`);
      return;
    }
    if (
      u.hash &&
      target.endsWith('.html') &&
      !idsOf(target).has(decodeURIComponent(u.hash.slice(1)))
    )
      broken.push(`${pagePath} → ${raw} (missing #id)`);
  });
}
console.log(
  `linkcheck: ${pages.length} pages, ${internal} internal links, ${external} external (not fetched), ${broken.length} broken`,
);
if (broken.length) {
  console.log([...new Set(broken)].slice(0, 50).join('\n'));
  process.exit(1);
}
