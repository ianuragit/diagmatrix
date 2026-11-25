/**
 * Scrubbed fixtures for Nuxt-payload sources (src-b): decodes the page payload,
 * keeps only the fields the adapter reads, shortens prose, remaps every record id
 * to a fake one, scrubs hosts/terms, and writes a tiny HTML page with the
 * re-encoded payload. Also writes a trimmed sitemap pair for discover().
 *
 *   tsx scripts/make-fixture-nuxt.ts <sourceId> <name>=<url> ... [--sitemap N]
 */
import * as cheerio from 'cheerio';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HttpClient, buildUserAgent } from '../pipeline/core/http.ts';
import { ROOT, loadSources, privateTerms } from '../pipeline/core/config.ts';
import { createLogger } from '../pipeline/core/log.ts';
import { scrubText } from '../pipeline/core/privacy.ts';
import { flatten, unflatten } from '../pipeline/sources/src-b/devalue.ts';

const args = process.argv.slice(2);
const sourceId = args.shift()!;
const smIdx = args.indexOf('--sitemap');
const sitemapN = smIdx >= 0 ? Number(args.splice(smIdx, 2)[1]) : 0;
const src = loadSources().find((s) => s.id === sourceId);
if (!src) throw new Error(`unknown source ${sourceId}`);
const sourceHost = new URL(src.baseUrl).hostname;
const terms = privateTerms();
const http = new HttpClient({
  userAgent: buildUserAgent(''),
  cacheDir: join(ROOT, '.cache', 'http'),
  offline: true,
  log: createLogger('fx', { silent: true }),
});
const outDir = join(ROOT, 'pipeline', 'sources', sourceId, 'fixtures');
mkdirSync(outDir, { recursive: true });

let next = 101;
const ids = new Map<number, number>();
const fake = (id: number) => (ids.has(id) ? ids.get(id)! : (ids.set(id, next++), ids.get(id)!));
const sentence = (t: unknown) => {
  const s = String(t ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return s ? (s.match(/^.{20,200}?[.!?](\s|$)/)?.[0] ?? s.slice(0, 120)).trim() : s;
};
const dates = { created_at: undefined, updated_at: undefined };

function trimAttrTypes(types: any[] = []) {
  return types.map((t) => ({
    key: t.key,
    name: t.name,
    suffix: t.suffix,
    attachments: t.attachments.map((a: any) => ({
      string_value: a.string_value,
      numeric_value: a.numeric_value,
    })),
  }));
}
function trimCategory(c: any): any {
  return c
    ? {
        name: c.name,
        slug: c.slug,
        parent: c.parent
          ? { name: c.parent.name, slug: c.parent.slug, parent: null, children: [] }
          : null,
        children: (c.children ?? []).map((x: any) => ({
          name: x.name,
          slug: x.slug,
          parent: null,
          children: [],
        })),
      }
    : null;
}
function trimProduct(p: any, depth = 0): any {
  return {
    id: fake(p.id),
    name: p.name,
    alternative_name: p.alternative_name ?? null,
    slug: p.slug,
    is_visible: p.is_visible,
    small_description: sentence(p.small_description),
    description: sentence(p.description),
    ...(depth === 0
      ? {
          manufacturer: p.manufacturer ? { name: p.manufacturer.name } : null,
          categories: (p.categories ?? []).map(trimCategory),
          media: (p.media ?? [])
            .slice(0, 1)
            .map((m: any) => ({ url: m.url, mime_type: m.mime_type })),
          knowledge_links: (p.knowledge_links ?? []).map((k: any) => ({
            link_category: { key: k.link_category.key, name: k.link_category.name },
            entries: (k.entries ?? [])
              .slice(0, 2)
              .map((e: any) => ({ name: e.name, url: e.url, is_visible: e.is_visible })),
          })),
          children: (p.children ?? []).map((c: any) => trimProduct(c, 1)),
          related_products: (p.related_products ?? []).map((r: any) => ({
            id: fake(r.id),
            slug: r.slug,
          })),
        }
      : {}),
    attachment_types: trimAttrTypes(p.attachment_types),
    ...dates,
  };
}

const check = (name: string, text: string) => {
  const lower = text.toLowerCase();
  const leaks = terms.filter((t) => lower.includes(t));
  if (leaks.length) throw new Error(`${name}: ${leaks.length} private term(s) remain; not written`);
};

for (const arg of args) {
  const [name, url] = arg.split(/=(.*)/s) as [string, string];
  const $ = cheerio.load((await http.get(url)).body);
  const root = unflatten($('#__NUXT_DATA__').text()) as any;
  const key = Object.keys(root.data).find((k) => k.startsWith('product-'))!;
  const payload = { data: { [key]: trimProduct(root.data[key]) }, serverRendered: true };
  const html = scrubText(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${root.data[key].name}</title></head>` +
      `<body><div id="__nuxt"><h2>${root.data[key].name}</h2></div>` +
      `<script type="application/json" data-nuxt-data="nuxt-app" id="__NUXT_DATA__">${flatten(payload)}</script></body></html>\n`,
    { terms, sourceHost, sourceId },
  );
  check(name, html);
  writeFileSync(join(outDir, `${name}.html`), html);
  console.log(`${name}.html ${(html.length / 1024).toFixed(1)} KB id→${fake(root.data[key].id)}`);
}

if (sitemapN) {
  const base = new URL('/', src.baseUrl).href;
  const index = (await http.get(new URL('/sitemap_index.xml', base).href)).body;
  const child = cheerio.load(index, { xml: true })('sitemap > loc').first().text().trim();
  const childXml = (await http.get(child)).body;
  const $x = cheerio.load(childXml, { xml: true });
  const locs = $x('url > loc')
    .map((_, e) => $x(e).text().trim())
    .get();
  const keep = [
    ...locs.filter((l) => !/\/products\/[^/]+$/.test(new URL(l).pathname)).slice(0, 4),
    ...locs.filter((l) => /\/products\/[^/]+$/.test(new URL(l).pathname)).slice(0, sitemapN),
  ];
  const urlset = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${keep.map((l) => `  <url><loc>${l}</loc></url>`).join('\n')}\n  <url><loc>https://elsewhere.example/products/not-ours</loc></url>\n</urlset>\n`;
  const idx = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${child}</loc></sitemap>\n</sitemapindex>\n`;
  for (const [n, body] of [
    ['sitemap-index.xml', idx],
    ['sitemap-child.xml', urlset],
  ] as const) {
    const t = scrubText(body, { terms, sourceHost, sourceId });
    check(n, t);
    writeFileSync(join(outDir, n), t);
  }
  console.log(`sitemap fixtures: ${keep.length} urls (${sitemapN} products)`);
}
