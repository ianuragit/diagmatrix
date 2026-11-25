/**
 * Duplicate detection. Key = lowercase, strip punctuation / brand / pack size /
 * filler words, collapse whitespace, sort tokens. Records sharing brand + key
 * form a group; the canonical record has the most spec fields filled (tie → lowest id).
 */
const FILLER = new Set([
  'test',
  'tests',
  'kit',
  'kits',
  'rapid',
  'device',
  'card',
  'cassette',
  'the',
  'for',
  'with',
  'and',
  'of',
  'ce',
  'professional',
  'use',
  'detection',
  'set',
]);

export function dedupeKey(name: string, brand: string | null, productLine?: string | null): string {
  let s = name.toLowerCase();
  if (brand)
    s = s.replace(
      new RegExp(`\\b${brand.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
      ' ',
    );
  s = s
    // Pack sizes only: "(48T)" or plural counts like "50 strips" — never "Combur 10 Test".
    .replace(/\(\s*\d+\s*t\s*\)|\b\d{2,}\s*(tests|strips)\b/g, ' ')
    .replace(/\+(?=\s|$|\))/g, ' plus ') // "Status+" is a model; "Ag+Ab" is just a separator
    .replace(/covid[\s-]*19/g, 'covid19')
    .replace(/sars[\s-]*cov[\s-]*2/g, 'sarscov2')
    .replace(/\bhiv[\s-]*1[\s/-]*2\b/g, 'hiv12')
    .replace(/\bigg[\s/]*igm\b|\bigm[\s/]*igg\b/g, 'iggigm')
    .replace(/(\d)\.(\d)/g, '$1_$2') // keep versions like 3.0 together
    .replace(/[^a-z0-9_]+/g, ' ');
  const tokens = s.split(/\s+/).filter((t) => t && !FILLER.has(t));
  void productLine;
  return [...new Set(tokens)].sort().join(' ');
}

export interface DedupeItem {
  id: string;
  key: string;
  brand: string | null;
  source: string;
  filled: number; // number of filled spec/fact fields
}

export interface DuplicateGroup {
  key: string;
  brand: string | null;
  canonical: string;
  members: string[];
}

/** Groups items by brand+key. Returns only groups with 2+ members. */
export function findGroups(items: DedupeItem[]): DuplicateGroup[] {
  const groups = new Map<string, DedupeItem[]>();
  for (const it of items) {
    if (!it.key) continue;
    const k = `${(it.brand ?? '').toLowerCase()}|${it.key}`;
    const g = groups.get(k);
    if (g) g.push(it);
    else groups.set(k, [it]);
  }
  const out: DuplicateGroup[] = [];
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const sorted = [...g].sort((a, b) => b.filled - a.filled || a.id.localeCompare(b.id));
    out.push({
      key: g[0]!.key,
      brand: g[0]!.brand,
      canonical: sorted[0]!.id,
      members: sorted.map((x) => x.id),
    });
  }
  return out.sort((a, b) => a.canonical.localeCompare(b.canonical));
}
