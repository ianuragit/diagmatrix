/**
 * Catalogue numbers from a brand's own website (pipeline/config/manufacturers.yaml).
 * Pages are fetched by HttpClient (robots.txt, throttle, cache); this module only
 * extracts {name, numbers} from a page and matches them to products of that brand.
 *
 * Matching is strict: every distinctive word of the product (line + name, model
 * digits included) must be in the manufacturer's product name. A unique exact
 * word-set match wins; otherwise a single full match; several → review.
 */
import type { Product } from '../core/types.ts';
import { dedupeKey } from '../normalise/dedupe.ts';
import type { EnrichmentEntry } from './fda-gudid.ts';

export interface ManufacturerConfig {
  brand: string;
  sitemap?: string;
  start_urls?: string[];
  product_url: string;
  exclude?: string;
  rewrite?: [string, string];
  name?: string;
  catalogue: string[];
  name_prefix?: string;
  only_prefix?: string;
  /** Products of other brands the site resells (name regex). */
  exclude_names?: string;
  /**
   * Instrument families (one regex each). A product used with an instrument only takes a number
   * whose name names that family, and a page naming a family only matches products used with it.
   */
  platforms?: string[];
}

export interface ManufacturerItem {
  name: string;
  catalogue_no: string;
  url: string;
}

const CAT_FORMAT = /^[A-Za-z0-9][A-Za-z0-9.\-/_]{1,23}$/;

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&reg;|®/g, '')
    .replace(/&trade;|™/g, '')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Name + catalogue number(s) from one product page, or null. */
export function extractItem(
  html: string,
  url: string,
  cfg: ManufacturerConfig,
): ManufacturerItem | null {
  const nameRe = new RegExp(cfg.name ?? '<h1[^>]*>([\\s\\S]*?)</h1>', 'i');
  const rawName = html.match(nameRe)?.[1];
  if (!rawName) return null;
  const name = decode(rawName.replace(/<[^>]+>/g, ' '));
  for (const re of cfg.catalogue) {
    const m = html.match(new RegExp(re, 'i'))?.[1];
    if (!m) continue;
    const nums = [
      ...new Set(
        m
          .split(/[,;|]/)
          .map((x) => x.trim())
          .filter((x) => CAT_FORMAT.test(x)),
      ),
    ];
    if (cfg.only_prefix && !nums.every((n) => new RegExp(cfg.only_prefix!, 'i').test(n)))
      return null;
    if (nums.length && nums.length <= 4) return { name, catalogue_no: nums.sort().join(', '), url };
  }
  return null;
}

/** Product URLs from a sitemap / sitemap index body. */
export function sitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decode(m[1]!));
}

/** Links on a category page that look like product pages. */
export function productLinks(html: string, base: string, cfg: ManufacturerConfig): string[] {
  const re = new RegExp(cfg.product_url, 'i');
  const out = new Set<string>();
  for (const m of html.matchAll(/href="([^"#]+)"/g)) {
    try {
      const u = new URL(decode(m[1]!), base).toString();
      if (re.test(u) && !(cfg.exclude && new RegExp(cfg.exclude, 'i').test(u))) out.add(u);
    } catch {
      /* ignore bad URLs */
    }
  }
  return [...out];
}

const FILLER = new Set([
  'test',
  'kit',
  'rapid',
  'device',
  'card',
  'cassette',
  'strip',
  'the',
  'for',
  'and',
  'with',
  'of',
  'in',
]);

/** Words that identify a product; unlike the FDA matcher, single letters (Strep A/B) and "plus" count. */
function words(s: string, prefix?: string): Set<string> {
  let t = s.toLowerCase();
  if (prefix) t = t.replace(new RegExp(prefix, 'i'), ' ');
  return new Set(
    dedupeKey(t, null)
      .split(' ')
      .filter((w) => w && !FILLER.has(w)),
  );
}

export function matchManufacturer(
  p: Pick<Product, 'name' | 'product_line' | 'subtype'>,
  items: ManufacturerItem[],
  cfg: Pick<ManufacturerConfig, 'name_prefix' | 'brand' | 'exclude_names' | 'platforms'>,
  /** Instrument(s) the product is used with + technology, e.g. "Colibri+ lamp". */
  context = '',
): EnrichmentEntry {
  const want = words(`${p.product_line ?? ''} ${p.name}`, cfg.name_prefix);
  const now = new Date().toISOString();
  const isControl = /\b(control|controls|kontroll\w*|calibrat\w*)\b/i.test(p.name);
  const scored = items
    .filter((it) => {
      const groups = (cfg.platforms ?? []).map((g) => new RegExp(g, 'i'));
      if (!groups.length) return true;
      const ctx = `${p.product_line ?? ''} ${p.name} ${context}`;
      const inItem = groups.filter((g) => g.test(it.name));
      const inCtx = groups.filter((g) => g.test(ctx));
      if (inItem.length && !inItem.some((g) => inCtx.includes(g))) return false;
      if (
        inCtx.length &&
        !inItem.length &&
        !/\b(analy[sz]er|reader|device|instrument)\b/i.test(p.name)
      )
        return false;
      return true;
    })
    .filter((it) => !(cfg.exclude_names && new RegExp(cfg.exclude_names, 'i').test(it.name)))
    .filter((it) => isControl || !/\b(control|controls|kontroll\w*|calibrat\w*)\b/i.test(it.name))
    .map((it) => {
      const have = words(it.name, cfg.name_prefix);
      let hit = 0;
      for (const t of want) if (have.has(t)) hit++;
      const exact = hit === want.size && have.size === want.size;
      return { it, score: want.size ? hit / want.size : 0, exact };
    })
    .filter((x) => x.score >= 1);
  const exact = scored.filter((x) => x.exact);
  const pick = exact.length === 1 ? exact : exact.length > 1 ? exact : scored;
  const cats = [...new Set(pick.map((x) => x.it.catalogue_no))];
  const candidates = pick.slice(0, 6).map((x) => ({
    catalogue_no: x.it.catalogue_no,
    di: null,
    brand_name: x.it.name,
    description: x.it.url,
    company: cfg.brand,
    score: x.score,
  }));
  const status: EnrichmentEntry['status'] = !cats.length
    ? 'none'
    : cats.length === 1 && want.size >= 1
      ? 'match'
      : 'ambiguous';
  return {
    status,
    catalogue_no: status === 'match' ? cats[0]! : null,
    candidates,
    query: null,
    checked_at: now,
  };
}
