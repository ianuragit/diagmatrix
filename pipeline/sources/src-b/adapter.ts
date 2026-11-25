/**
 * src-b adapter. Discovery from the sitemap (preferred by the brief; robots.txt
 * points at it). Parsing reads the embedded Nuxt payload — a structured product
 * record — instead of the German prose around it. Facts only.
 */
import * as cheerio from 'cheerio';
import type {
  NavEntry,
  ParsedProduct,
  ProductDocument,
  SourceAdapter,
  SourceConfig,
} from '../../core/types.ts';
import { unflatten } from './devalue.ts';
import { DOC_TYPES, FACT_KEYS, SELECTORS as S } from './selectors.ts';

interface Attachment {
  string_value: string | null;
  numeric_value: number | null;
}
interface AttachmentType {
  key: string;
  name: string;
  suffix: string | null;
  attachments: Attachment[];
}
interface Category {
  name: string;
  slug: string;
  parent: Category | null;
  children: Category[];
}
interface NuxtProduct {
  id: number;
  name: string;
  alternative_name: string | null;
  slug: string;
  is_visible?: boolean;
  small_description?: string | null;
  description?: string | null;
  manufacturer?: { name: string } | null;
  categories?: Category[];
  attachment_types?: AttachmentType[];
  media?: { url: string; mime_type?: string }[];
  knowledge_links?: {
    link_category: { key: string; name: string };
    entries?: { name: string; url: string; is_visible?: boolean }[];
  }[];
  children?: NuxtProduct[];
  related_products?: { id: number; slug: string }[];
}

const clean = (t: unknown): string =>
  String(t ?? '')
    .replace(/\s+/g, ' ')
    .trim();

export function parseSitemapLocs(xml: string): { sitemaps: string[]; urls: string[] } {
  const $ = cheerio.load(xml, { xml: true });
  return {
    sitemaps: $(S.sitemapLoc)
      .map((_, e) => clean($(e).text()))
      .get(),
    urls: $(S.urlLoc)
      .map((_, e) => clean($(e).text()))
      .get(),
  };
}

export function extractProduct(html: string): NuxtProduct {
  const $ = cheerio.load(html);
  const raw = $(S.nuxtData).first().text();
  if (!raw) throw new Error('no __NUXT_DATA__ payload');
  const root = unflatten(raw) as { data?: Record<string, unknown> };
  const key = Object.keys(root.data ?? {}).find((k) => k.startsWith(S.productKeyPrefix));
  const product = key ? (root.data![key] as NuxtProduct | null) : null;
  if (!product || typeof product !== 'object' || !product.name)
    throw new Error('no product record in payload');
  return product;
}

function attributeMap(
  types: AttachmentType[] = [],
): Record<string, { label: string; value: string }> {
  const out: Record<string, { label: string; value: string }> = {};
  for (const t of types) {
    const values = t.attachments
      .map((a) =>
        a.string_value != null
          ? clean(a.string_value)
          : a.numeric_value != null
            ? String(a.numeric_value)
            : '',
      )
      .filter(Boolean);
    if (!values.length) continue;
    out[t.key] = {
      label: t.suffix ? `${clean(t.name)} (${t.suffix})` : clean(t.name),
      value: values.join(', '),
    };
  }
  return out;
}

const toSpecs = (attrs: ReturnType<typeof attributeMap>): Record<string, string> =>
  Object.fromEntries(Object.values(attrs).map((a) => [a.label, a.value]));

/** Leaf categories (most specific) first, then parents; names only. */
function categoryNames(cats: Category[] = []): string[] {
  const leaves = cats.filter((c) => !c.children?.length).map((c) => clean(c.name));
  const parents = cats.filter((c) => c.children?.length).map((c) => clean(c.name));
  return [...new Set([...leaves, ...parents])];
}

export function parseProductHtml(html: string, entry: NavEntry, sourceHost: string): ParsedProduct {
  const p = extractProduct(html);
  if (p.is_visible === false) throw new Error('product marked not visible');
  const attrs = attributeMap(p.attachment_types);
  const specs = toSpecs(attrs);
  const cats = categoryNames(p.categories);

  const facts: Record<string, string> = {};
  if (p.manufacturer?.name) facts['Manufacturer'] = clean(p.manufacturer.name);
  for (const k of FACT_KEYS) if (attrs[k]) facts[attrs[k].label] = attrs[k].value;
  if (cats.length) facts['Categories'] = cats.join(', ');
  if (p.alternative_name) facts['Alternative name'] = clean(p.alternative_name);

  const documents: ProductDocument[] = [];
  const seen = new Set<string>();
  for (const link of p.knowledge_links ?? []) {
    const type = DOC_TYPES[link.link_category.key];
    if (!type) continue;
    for (const e of link.entries ?? []) {
      if (e.is_visible === false || !e.url || seen.has(e.url)) continue;
      let url: URL;
      try {
        url = new URL(e.url);
      } catch {
        continue;
      }
      if (!/^https?:$/.test(url.protocol)) continue;
      seen.add(e.url);
      documents.push({
        title: clean(e.name) || link.link_category.name,
        url: url.href,
        type: /\.pdf$/i.test(url.pathname) && type !== 'study' ? 'pdf' : type,
      });
    }
  }

  const image = p.media?.find((m) => /^https?:\/\//.test(m.url))?.url ?? null;
  const description = [p.small_description, p.description].map(clean).filter(Boolean).join('\n\n');

  return {
    source: 'src-b',
    source_id: String(p.id),
    url: entry.url,
    name: clean(p.name),
    category: cats[0] ?? null,
    subcategory: cats[1] ?? null,
    brand: p.manufacturer?.name ? clean(p.manufacturer.name) : null,
    catalogue_no: null, // the source publishes no manufacturer catalogue numbers
    specs,
    facts,
    image,
    // Documents hosted by the source itself would expose it; normalise drops those
    // for publication anyway, but don't even collect them here.
    documents: documents.filter(
      (d) =>
        new URL(d.url).hostname !== sourceHost &&
        !new URL(d.url).hostname.endsWith(`.${sourceHost}`),
    ),
    components: (p.children ?? [])
      .filter((c) => c.is_visible !== false && c.name)
      .map((c) => ({
        source_id: String(c.id),
        name: clean(c.name),
        specs: toSpecs(attributeMap(c.attachment_types)),
      })),
    related_source_ids: (p.related_products ?? []).map((r) => String(r.id)),
    description_raw: description || null,
  };
}

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  const host = new URL(cfg.baseUrl).hostname.replace(/^www\./, '');
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,

    async discover(ctx) {
      const index = await ctx.get(new URL(S.sitemapIndexPath, cfg.baseUrl).href);
      const { sitemaps, urls: direct } = parseSitemapLocs(index.body);
      const urls = [...direct];
      for (const sm of sitemaps) {
        const res = await ctx.get(sm);
        urls.push(...parseSitemapLocs(res.body).urls);
      }
      const products = [...new Set(urls)].filter((u) => {
        const url = new URL(u);
        return url.hostname.replace(/^www\./, '') === host && S.productPath.test(url.pathname);
      });
      ctx.log.info('sitemap parsed', {
        sitemaps: sitemaps.length,
        urls: urls.length,
        products: products.length,
      });
      // Category is not known until the page is parsed; the payload supplies it.
      return products.map((url) => ({
        category: 'Uncategorised',
        subcategory: null,
        name: decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() ?? ''),
        url,
      }));
    },

    parseProduct(html, entry) {
      return { ...parseProductHtml(html, entry, host), source: cfg.id };
    },
  };
}
