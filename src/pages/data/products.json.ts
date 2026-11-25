/** Public catalogue: canonical products (no duplicates), each with its page URL. */
import type { APIRoute } from 'astro';
import { liveProducts } from '../../lib/catalogue';
import { abs } from '../../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const live = (await liveProducts()).sort((a, b) => a.id.localeCompare(b.id));
  const out = live.map(({ duplicate_of: _d, ...p }) => ({
    ...p,
    url: abs(`/products/${p.slug}/`, site),
  }));
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
};
