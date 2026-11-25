/** /llms.txt — concise site map for LLMs (https://llmstxt.org). */
import type { APIRoute } from 'astro';
import {
  analyteLabel,
  brandSlug,
  categoryIntro,
  categoryLabel,
  groupBy,
  liveProducts,
  taxonomy,
  techLabel,
} from '../lib/catalogue';
import { site, DISCLAIMER } from '../lib/site';
import { abs } from '../lib/seo';

export const GET: APIRoute = async ({ site: s }) => {
  const live = await liveProducts();
  const byCat = groupBy(live, (p) => p.category);
  const brands = [...groupBy(live, (p) => p.brand)].sort((a, b) => b[1].length - a[1].length);
  const analytes = [...groupBy(live, (p) => p.analyte)].sort((a, b) => b[1].length - a[1].length);
  const techs = [...groupBy(live, (p) => p.technology)].sort((a, b) => b[1].length - a[1].length);
  const out = [
    `# ${site.name}`,
    '',
    `> ${site.name} is a directory of ${live.length} in-vitro diagnostic (IVD) products from ${brands.length} brands: rapid tests, immunoassays, molecular tests, point-of-care analysers, reagents and consumables. Each product page states brand, technology, analytes, sample types, pack size and catalogue number where known. No prices are listed.`,
    '',
    DISCLAIMER,
    '',
    '## Machine-readable data',
    `- [All products (JSON)](${abs('/data/products.json', s)}): canonical catalogue, one object per product`,
    `- [Full product list (text)](${abs('/llms-full.txt', s)}): one compact entry per product`,
    `- Per-product JSON: ${abs('/products/', s)}{slug}.json`,
    '',
    '## Categories',
    ...Object.keys(taxonomy.categories)
      .filter((c) => byCat.has(c))
      .map(
        (c) =>
          `- [${categoryLabel(c)}](${abs(`/categories/${c}/`, s)}): ${byCat.get(c)!.length} products. ${categoryIntro(c)}`,
      ),
    '',
    '## Technologies',
    ...techs.map(
      ([t, l]) => `- [${techLabel(t)}](${abs(`/technology/${t}/`, s)}): ${l.length} products`,
    ),
    '',
    '## Analytes',
    ...analytes.map(
      ([a, l]) => `- [${analyteLabel(a)}](${abs(`/analytes/${a}/`, s)}): ${l.length} products`,
    ),
    '',
    '## Brands',
    ...brands.map(
      ([b, l]) => `- [${b}](${abs(`/brands/${brandSlug(b)}/`, s)}): ${l.length} products`,
    ),
    '',
    '## Optional',
    `- [About](${abs('/about/', s)})`,
    `- [Request a product not listed](${abs('/request-product/', s)})`,
    '',
  ];
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
