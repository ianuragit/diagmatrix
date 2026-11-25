/**
 * Build-time catalogue helpers: the product collection, taxonomy labels and the
 * groupings that drive hub pages. Server-side only.
 */
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { Product } from '../../pipeline/core/types.ts';
import { slugify } from '../../pipeline/core/slug.ts';
import type { Taxonomy } from '../../pipeline/normalise/classify.ts';

export type { Product };

export const taxonomy = parse(
  readFileSync(join(process.cwd(), 'pipeline', 'config', 'taxonomy.yaml'), 'utf8'),
) as Taxonomy;

/** URL slugs for product-type subcategories. */
export const SUB_SLUGS: Record<string, string> = {
  instrument: 'instruments',
  reagent: 'tests-reagents',
  control: 'controls-calibrators',
  consumable: 'consumables',
};
export const SUB_FROM_SLUG = Object.fromEntries(Object.entries(SUB_SLUGS).map(([k, v]) => [v, k]));

let cache: Product[] | null = null;
export async function allProducts(): Promise<Product[]> {
  if (!cache)
    cache = (await getCollection('products'))
      .map((e) => e.data)
      .sort((a, b) => a.id.localeCompare(b.id));
  return cache;
}
/** Canonical (non-duplicate) products, sorted by display name. */
export async function liveProducts(): Promise<Product[]> {
  return (await allProducts())
    .filter((p) => !p.duplicate_of)
    .sort((a, b) => displayName(a).localeCompare(displayName(b)));
}

export const displayName = (p: Pick<Product, 'brand' | 'name'>) =>
  [p.brand, p.name].filter(Boolean).join(' ');
export const brandSlug = (b: string) => slugify(b);

export const categoryLabel = (id: string | null) =>
  id ? (taxonomy.categories[id]?.label ?? id) : 'Uncategorised';
export const categoryIntro = (id: string) => taxonomy.categories[id]?.intro ?? '';
export const subLabel = (id: string | null) => (id ? (taxonomy.subcategories[id] ?? id) : 'Other');
export const techLabel = (id: string | null) => (id ? (taxonomy.technology[id]?.label ?? id) : '—');
export const analyteLabel = (id: string) => taxonomy.analytes[id]?.label ?? id;
export const analyteGroup = (id: string) => taxonomy.analytes[id]?.group ?? 'Other';
export const sampleLabel = (id: string) => taxonomy.sample_types[id]?.label ?? id;
export const typeLabel = (t: string | null) =>
  t === 'instrument'
    ? 'Instrument'
    : t === 'reagent'
      ? 'Test / reagent'
      : t === 'consumable'
        ? 'Consumable'
        : '—';

export function packLabel(p: Product): string | null {
  if (!p.pack_size) return null;
  return `${p.pack_size.value} ${p.pack_size.unit}`;
}

export function groupBy<K extends string>(
  products: Product[],
  key: (p: Product) => K | K[] | null,
): Map<K, Product[]> {
  const m = new Map<K, Product[]>();
  for (const p of products) {
    const k = key(p);
    for (const x of Array.isArray(k) ? k : k ? [k] : []) (m.get(x) ?? m.set(x, []).get(x)!).push(p);
  }
  return m;
}

/** Old product slugs → current slug (data/redirects.json), e.g. after translation re-slugging. */
export function productRedirects(): Record<string, string> {
  try {
    return JSON.parse(
      readFileSync(join(process.cwd(), 'data', 'redirects.json'), 'utf8'),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

/** A hub with fewer products than this is "thin" → noindex until it grows. */
export const THIN_HUB = 3;
export const PAGE_SIZE = 24;
