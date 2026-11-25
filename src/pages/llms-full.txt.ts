/** /llms-full.txt — one compact, factual entry per canonical product. */
import type { APIRoute } from 'astro';
import {
  analyteLabel,
  categoryLabel,
  displayName,
  liveProducts,
  packLabel,
  sampleLabel,
  techLabel,
  typeLabel,
} from '../lib/catalogue';
import { site, DISCLAIMER } from '../lib/site';
import { abs } from '../lib/seo';

export const GET: APIRoute = async ({ site: s }) => {
  const live = await liveProducts();
  const entries = live.map((p) => {
    const facts = [
      p.brand && `Brand: ${p.brand}`,
      `Category: ${categoryLabel(p.category)}`,
      p.technology && `Technology: ${techLabel(p.technology)}`,
      p.analyte.length && `Analytes: ${p.analyte.map(analyteLabel).join(', ')}`,
      p.sample_type.length && `Sample: ${p.sample_type.map(sampleLabel).join(', ')}`,
      p.product_type && `Type: ${typeLabel(p.product_type)}`,
      packLabel(p) && `Pack: ${packLabel(p)}`,
      p.catalogue_no && `Cat. no.: ${p.catalogue_no}`,
      `Updated: ${p.updated_at}`,
    ].filter(Boolean);
    return [
      `## ${displayName(p)}`,
      `URL: ${abs(`/products/${p.slug}/`, s)}`,
      facts.join(' | '),
      p.summary ?? '',
    ]
      .filter(Boolean)
      .join('\n');
  });
  const head = [
    `# ${site.name} — full product list`,
    '',
    `> ${live.length} in-vitro diagnostic products. ${DISCLAIMER}`,
    '',
  ];
  return new Response([...head, ...entries].join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
