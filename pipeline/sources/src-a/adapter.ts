/**
 * src-a adapter. Discovery: one homepage fetch — its nav lists every category and
 * every product. Parsing: title, breadcrumb category, spec lists, fact table,
 * main image, PDF links. Facts only; interpretation happens in pipeline/normalise.
 */
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type {
  NavEntry,
  ParsedProduct,
  ProductDocument,
  SourceAdapter,
  SourceConfig,
} from '../../core/types.ts';
import { BRAND_KEYS, CATALOGUE_KEYS, SELECTORS as S } from './selectors.ts';

const clean = (t: string | undefined | null): string =>
  (t ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** Normalise a spec key for storage: trimmed, no trailing colon. */
const cleanKey = (t: string): string => clean(t).replace(/\s*[:;]+\s*$/, '');

export function parseNav(html: string, pageUrl: string): NavEntry[] {
  const $ = cheerio.load(html);
  const business = $(S.navTopItems).filter(
    (_, li) => clean($(li).children('a').text()) === S.navBusinessLabel,
  );
  const out: NavEntry[] = [];
  business.find(S.navCategoryItems).each((_, catLi) => {
    const category = clean($(catLi).find(S.navCategoryLink).first().text());
    $(catLi)
      .find(S.navProductLinks)
      .each((_, a) => {
        const href = $(a).attr('href');
        const name = clean($(a).text());
        if (!href || !name || !S.productUrlId.test(href)) return;
        out.push({ category, subcategory: null, name, url: new URL(href, pageUrl).href });
      });
  });
  return out;
}

function readPairs(
  $: CheerioAPI,
  rows: string,
  scope?: cheerio.Cheerio<any>,
): Record<string, string> {
  const out: Record<string, string> = {};
  (scope ? scope.find(rows) : $(rows)).each((_, li) => {
    const k = cleanKey($(li).find(S.specKey).first().text());
    const v = clean($(li).find(S.specValue).first().text());
    if (k && v && !(k in out)) out[k] = v;
  });
  return out;
}

export function parseProductHtml(html: string, entry: NavEntry, sourceId: string): ParsedProduct {
  const $ = cheerio.load(html);
  const crumbs = $(S.breadcrumbItems)
    .map((_, e) => clean($(e).text()))
    .get();
  // Home > Products > {Category} > {Product}
  const category = crumbs.length >= 4 ? crumbs[crumbs.length - 2]! : entry.category;

  // Full spec blocks first, then the short "Product Details" list for anything missing.
  const specs: Record<string, string> = {};
  $(S.specBlocks).each((_, block) => {
    const heading = clean($(block).find(S.specBlockHeading).first().text());
    if (!S.specBlockKeep.test(heading)) return;
    Object.assign(specs, { ...readPairs($, S.specRows, $(block)), ...specs });
  });
  $(S.detailRows).each((_, li) => {
    const spans = $(li).children('span');
    if (spans.length !== 2) return;
    const k = cleanKey(spans.eq(0).text());
    const v = clean(spans.eq(1).text());
    if (k && v && !(k in specs)) specs[k] = v;
  });

  const facts: Record<string, string> = {};
  $(S.factRows).each((_, tr) => {
    const cells = $(tr).children('td,th');
    if (cells.length !== 2) return;
    const k = cleanKey(cells.eq(0).text());
    const v = clean(cells.eq(1).text());
    if (k && v && !(k in facts)) facts[k] = v;
  });

  const brandKey = Object.keys(facts).find((k) => BRAND_KEYS.test(k));
  const catKey = Object.keys(facts).find((k) => CATALOGUE_KEYS.test(k));

  // Description text without the fact table and FAQ — kept privately for fact extraction only.
  const desc = $(S.description).first().clone();
  desc
    .find(S.faqBlock)
    .filter((_, d) => /FAQ/i.test($(d).find('h2').first().text()))
    .remove();
  desc.find('table, h2, script, style').remove();
  const description = clean(desc.text());

  const imgSrc = $(S.mainImage).first().attr('src');
  let image: string | null = null;
  if (imgSrc && /^https?:\/\//.test(imgSrc)) image = imgSrc;

  const documents: ProductDocument[] = [];
  const seenDocs = new Set<string>();
  $(S.documentLinks).each((_, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    const url = new URL(href, entry.url).href;
    if (seenDocs.has(url)) return;
    seenDocs.add(url);
    documents.push({ title: clean($(a).text()) || 'Document', url, type: 'pdf' });
  });

  return {
    source: 'src-a',
    source_id: sourceId,
    url: entry.url,
    name: clean($(S.name).first().text()) || entry.name,
    category: category || null,
    subcategory: entry.subcategory ?? null,
    brand: brandKey ? facts[brandKey]! : null,
    catalogue_no: catKey ? facts[catKey]! : null,
    specs,
    facts,
    image,
    documents,
    description_raw: description || null,
  };
}

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,

    async discover(ctx) {
      const res = await ctx.get(new URL('/', cfg.baseUrl).href);
      const entries = parseNav(res.body, res.url);
      const cats = new Map<string, number>();
      for (const e of entries) cats.set(e.category, (cats.get(e.category) ?? 0) + 1);
      ctx.log.info('nav parsed', { categories: cats.size, products: entries.length });
      return entries;
    },

    parseProduct(html, entry) {
      const id = S.productUrlId.exec(new URL(entry.url).pathname)?.[1];
      if (!id) throw new Error(`No record id in URL ${entry.url}`);
      const p = parseProductHtml(html, entry, id);
      return { ...p, source: cfg.id };
    },
  };
}
