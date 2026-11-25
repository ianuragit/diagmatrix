/**
 * Template adapter. Copy this folder to pipeline/sources/<id>/, then:
 *  - set ID/BASE_URL (must match pipeline/config/sources.yaml),
 *  - implement discover() using ctx.get() only (never fetch directly),
 *  - implement parseProduct() as a pure function of the HTML,
 *  - save real pages as fixtures/*.html and cover them in adapter.test.ts.
 */
import * as cheerio from 'cheerio';
import type { NavEntry, ParsedProduct, SourceAdapter, SourceConfig } from '../../core/types.ts';
import { SELECTORS } from './selectors.ts';

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,

    async discover(ctx) {
      const res = await ctx.get(cfg.baseUrl + '/');
      const $ = cheerio.load(res.body);
      const entries: NavEntry[] = [];
      $(SELECTORS.navLinks).each((_, el) => {
        const href = $(el).attr('href');
        const name = $(el).text().trim();
        if (href && name)
          entries.push({ category: 'Uncategorised', name, url: new URL(href, res.url).href });
      });
      return entries;
    },

    parseProduct(html: string, entry: NavEntry): ParsedProduct {
      const $ = cheerio.load(html);
      const specs: Record<string, string> = {};
      $(SELECTORS.specRows).each((_, tr) => {
        const k = $(tr).find('th,td').first().text().trim();
        const v = $(tr).find('td').last().text().trim();
        if (k && v && k !== v) specs[k] = v;
      });
      return {
        source: cfg.id,
        source_id: new URL(entry.url).pathname,
        url: entry.url,
        name: $(SELECTORS.productName).first().text().trim() || entry.name,
        category: entry.category,
        subcategory: entry.subcategory ?? null,
        brand: null,
        catalogue_no: null,
        specs,
        facts: {},
        components: [],
        related_source_ids: [],
        image: null,
        documents: [],
        description_raw: null,
      };
    },
  };
}
