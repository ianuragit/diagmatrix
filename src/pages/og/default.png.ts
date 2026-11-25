/** Site-wide Open Graph image. */
import type { APIRoute } from 'astro';
import { groupBy, liveProducts } from '../../lib/catalogue';
import { renderOg } from '../../lib/og';
import { site } from '../../lib/site';

export const GET: APIRoute = async () => {
  const live = await liveProducts();
  const png = renderOg({
    siteName: site.name,
    kicker: 'In-vitro diagnostics directory',
    title: 'Find and compare diagnostic products',
    facts: [
      `${live.length.toLocaleString('en')} products`,
      `${groupBy(live, (p) => p.brand).size} brands`,
      'Rapid tests · Immunoassays · Molecular · Analysers',
    ],
  });
  return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
};
