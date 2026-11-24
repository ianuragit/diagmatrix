import { createHash } from 'node:crypto';

/** URL-safe slug: ascii, lowercase, hyphen-separated. Deterministic. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function shortHash(input: string, len = 6): string {
  return createHash('sha1').update(input).digest('hex').slice(0, len);
}

export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

/**
 * Stable ID allocation. `idMap` persists `{ stableKey -> id }` across runs
 * (data/id-map.json), so a product keeps its URL even if a later run would
 * otherwise produce a different base slug or collision order.
 *
 * stableKey should identify the product independently of display fields,
 * e.g. "saaskin:1234567" for the canonical source record.
 */
export function allocateId(
  stableKey: string,
  base: string,
  idMap: Map<string, string>,
  taken: Set<string>,
): string {
  const existing = idMap.get(stableKey);
  if (existing) {
    taken.add(existing);
    return existing;
  }
  const baseSlug = slugify(base) || 'product';
  let id = baseSlug;
  if (taken.has(id)) id = `${baseSlug}-${shortHash(stableKey)}`;
  let n = 2;
  while (taken.has(id)) id = `${baseSlug}-${shortHash(stableKey + n++)}`;
  idMap.set(stableKey, id);
  taken.add(id);
  return id;
}

/** Allocator pre-seeded with every persisted id, so new ids never steal an old URL. */
export function createIdAllocator(idMap: Map<string, string>) {
  const taken = new Set(idMap.values());
  return (stableKey: string, base: string) => allocateId(stableKey, base, idMap, taken);
}
