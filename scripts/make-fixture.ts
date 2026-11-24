/**
 * Turn cached pages into SCRUBBED test fixtures.
 *
 *   tsx scripts/make-fixture.ts <sourceId> <name>=<url> [<name>=<url> ...] [--nav-sample N]
 *
 * - Reads only from the HTTP cache (never the network).
 * - Removes scripts, styles, forms, comments, inline styles, meta/link tags.
 * - Product pages: keeps only the title/details and specs/description blocks.
 *   Pages named "nav": keeps only the nav,
 *   trimmed to the first N products per category.
 * - Replaces the source host with <id>.example, other private hosts with
 *   img-cdn.example, private terms with "ExampleSource", redacts emails/phones,
 *   strips social links, and remaps real record ids to fake ones (1000001, 1000002, ...).
 * - Refuses to write a fixture that still contains a private term.
 * Terms come from the git-ignored sources.local.yaml, so this file names nothing.
 */
import * as cheerio from 'cheerio';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HttpClient, buildUserAgent } from '../pipeline/core/http.ts';
import { ROOT, loadSources, privateTerms } from '../pipeline/core/config.ts';
import { createLogger } from '../pipeline/core/log.ts';

const args = process.argv.slice(2);
const sourceId = args.shift();
const navSampleIdx = args.indexOf('--nav-sample');
const navSample = navSampleIdx >= 0 ? Number(args.splice(navSampleIdx, 2)[1]) : 3;
if (!sourceId || !args.length) {
  console.error('usage: tsx scripts/make-fixture.ts <sourceId> <name>=<url> ...');
  process.exit(2);
}
const src = loadSources().find((s) => s.id === sourceId);
if (!src) throw new Error(`unknown source ${sourceId}`);
const sourceHost = new URL(src.baseUrl).hostname;
const terms = privateTerms();
const http = new HttpClient({
  userAgent: buildUserAgent(''),
  cacheDir: join(ROOT, '.cache', 'http'),
  offline: true,
  log: createLogger('fixture', { silent: true }),
});

const idMap = new Map<string, string>();
let nextId = 1000001;
const fakeId = (real: string) => {
  const key = String(Number(real)); // "09652535" and "9652535" are the same record
  if (!idMap.has(key)) idMap.set(key, String(nextId++));
  return idMap.get(key)!;
};
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function scrub(html: string): string {
  let out = html;
  // Hosts: source → <id>.example; any other host containing a private term → img-cdn.example
  out = out.replace(
    new RegExp(`(?:www\\.)?${esc(sourceHost.replace(/^www\./, ''))}`, 'gi'),
    `${sourceId}.example`,
  );
  out = out.replace(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|in|org|co)\b/gi, (host) =>
    terms.some((t) => host.toLowerCase().includes(t)) ? 'img-cdn.example' : host,
  );
  // Record ids in product URLs and image paths
  out = out.replace(/-(\d{6,9})\.html/g, (_, id: string) => `-${fakeId(id)}.html`);
  out = out.replace(/\/(\d{7,9})\//g, (_, id: string) => `/${fakeId(id)}/`);
  out = out.replace(
    /(_|send_a_inq_|product_id=)(\d{6,9})\b/g,
    (_, p: string, id: string) => `${p}${fakeId(id)}`,
  );
  // Private terms, emails, phones
  for (const t of [...terms].sort((a, b) => b.length - a.length))
    out = out.replace(new RegExp(esc(t), 'gi'), 'ExampleSource');
  out = out.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, 'redacted@example.com');
  // Phone-like digit runs, but not inside slugs/paths (model numbers next to record ids).
  out = out.replace(/(?<![\w/.-])\+?\d[\d\s-]{9,}\d(?![\w./-])/g, (m) =>
    m.replace(/\D/g, '').length >= 10 ? '0000000000' : m,
  );
  return out;
}

const outDir = join(ROOT, 'pipeline', 'sources', sourceId, 'fixtures');
mkdirSync(outDir, { recursive: true });

for (const arg of args) {
  const [name, url] = arg.split(/=(.*)/s) as [string, string];
  const res = await http.get(url);
  const $ = cheerio.load(res.body);
  $('script, style, noscript, link, iframe, form, svg, meta:not([charset])').remove();
  $('*')
    .contents()
    .filter((_, n) => n.type === 'comment')
    .remove();
  $('[style]').removeAttr('style');
  $('[onclick], [onsubmit], [onfocus], [onblur]').each((_, el) => {
    for (const a of ['onclick', 'onsubmit', 'onfocus', 'onblur']) $(el).removeAttr(a);
  });

  if (name === 'nav') {
    const nav = $('#cssmenu').first();
    nav.find('ul ul ul').each((_, ul) => {
      $(ul).children('li').slice(navSample).remove();
    });
    $('body').empty().append(nav);
  } else {
    // Keep only what parseProduct reads: the title/details block and the specs/description block.
    const keep = $('#productInfoSectionMain, .other-info-section-main').clone();
    $('body').empty().append(keep);
    $(
      '[class*="related"], [id*="related"], [class*="similar"], .other-products-section-main, #inq_pp1, .rfqFormDtlPage',
    ).remove();
    $('div')
      .filter(
        (_, d) => /receive call from/i.test($(d).text()) && $(d).find('#productInfo').length === 0,
      )
      .remove();
    // Don't commit long marketing copy: keep the fact table, one sentence, and an FAQ stub.
    $('#productDescription').each((_, d) => {
      const table = $(d).find('table').first();
      const tableHtml = table.length ? $.html(table) : '';
      const firstText = $(d)
        .clone()
        .find('table, h2, h3, div[align="justify"]')
        .remove()
        .end()
        .text()
        .replace(/\s+/g, ' ')
        .trim();
      const sentence = (
        firstText.match(/^.{20,240}?[.!?](\s|$)/)?.[0] ?? firstText.slice(0, 160)
      ).trim();
      const hasFaq = /FAQ/i.test($(d).find('div[align="justify"] h2').first().text());
      $(d).html(
        `<div><h2>Product Description</h2>${tableHtml}<br><p>${sentence}</p>` +
          (hasFaq
            ? '<div align="justify"><h2>FAQ\'s of this product:</h2><h3>Q: Trimmed?</h3><span>A:</span> Yes.</div>'
            : '') +
          '</div>',
      );
    });
  }
  $(
    'a[href*="facebook."], a[href*="linkedin."], a[href*="youtube."], a[href*="twitter."], a[href*="instagram."], a[href*="x.com/"]',
  ).remove();
  $('head').empty().append('<meta charset="utf-8">');

  const html = scrub($.html()).replace(/\n\s*\n+/g, '\n');
  const lower = html.toLowerCase();
  const leaks = terms.filter((t) => lower.includes(t));
  if (leaks.length)
    throw new Error(`fixture ${name} still contains ${leaks.length} private term(s); not written`);
  writeFileSync(join(outDir, `${name}.html`), html);
  console.log(
    `${name}.html  ${(html.length / 1024).toFixed(1)} KB  (record id → ${fakeId(/-(\d+)\.html$/.exec(url)?.[1] ?? '0')})`,
  );
}
