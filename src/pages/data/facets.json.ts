/** Compact facet index for the client-side filter island. */
import type { APIRoute } from 'astro';
import {
  analyteLabel,
  brandSlug,
  categoryLabel,
  liveProducts,
  packLabel,
  sampleLabel,
  subLabel,
  taxonomy,
  techLabel,
} from '../../lib/catalogue';

export const GET: APIRoute = async () => {
  const products = await liveProducts();
  const dims = {
    brand: [],
    category: [],
    technology: [],
    analyte: [],
    sample: [],
    type: [],
  } as Record<string, { key: string; label: string }[]>;
  const index: Record<string, Map<string, number>> = Object.fromEntries(
    Object.keys(dims).map((k) => [k, new Map()]),
  );
  const id = (dim: string, key: string, label: string) => {
    let i = index[dim]!.get(key);
    if (i === undefined) {
      i = dims[dim]!.push({ key, label }) - 1;
      index[dim]!.set(key, i);
    }
    return i;
  };
  const items = products.map((p) => [
    p.slug,
    p.brand ?? '',
    p.name,
    id('brand', brandSlug(p.brand ?? 'unknown'), p.brand ?? 'Unknown'),
    id('category', p.category ?? 'general', categoryLabel(p.category)),
    p.technology ? id('technology', p.technology, techLabel(p.technology)) : -1,
    p.analyte.map((a) => id('analyte', a, analyteLabel(a))),
    p.sample_type.map((s) => id('sample', s, sampleLabel(s))),
    p.subcategory ? id('type', p.subcategory, subLabel(p.subcategory)) : -1,
    p.catalogue_no ?? '',
    packLabel(p) ?? '',
  ]);
  void taxonomy;
  return new Response(JSON.stringify({ dims, items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
