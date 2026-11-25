/**
 * Catalogue-number enrichment from the FDA Global Unique Device Identification
 * Database (GUDID), via openFDA's device/udi endpoint. Manufacturer-submitted,
 * so the catalogue/model numbers are the manufacturer's own references.
 *
 * Strict matching: the record's company must belong to the brand, every
 * distinctive word of the product name must appear in the record, controls /
 * calibrators are only matched to controls, and several catalogue numbers are
 * accepted only when they are pack-size variants of the same device.
 */
import type { Product } from '../core/types.ts';
import { dedupeKey } from '../normalise/dedupe.ts';

export interface GudidRecord {
  company_name?: string;
  brand_name?: string;
  version_or_model_number?: string;
  catalog_number?: string | null;
  device_description?: string;
  identifiers?: { id: string; type: string }[];
}

export interface EnrichmentEntry {
  status: 'match' | 'match-variants' | 'ambiguous' | 'none' | 'skipped';
  catalogue_no: string | null;
  candidates: {
    catalogue_no: string;
    di: string | null;
    brand_name: string;
    description: string;
    company: string;
    score: number;
  }[];
  query: string | null;
  checked_at: string;
}

/** Companies (incl. subsidiaries) that file GUDID records for a brand. */
export const COMPANY_PATTERNS: Record<string, RegExp> = {
  Abbott: /abbott|alere|abaxis|binax|ameditech|trinity biotech/i,
  Roche: /roche|ventana/i,
  'Siemens Healthineers': /siemens|bayer/i,
  'Becton Dickinson': /becton|\bbd\b/i,
  Cepheid: /cepheid/i,
  QuidelOrtho: /quidel|ortho clinical/i,
  Sysmex: /sysmex/i,
  'Nova Biomedical': /nova biomedical/i,
  Radiometer: /radiometer/i,
  HemoCue: /hemocue/i,
  Werfen: /werfen|instrumentation lab|accriva|itc\b/i,
  'Bio-Rad': /bio-rad/i,
  'Meridian Bioscience': /meridian|magellan/i,
  'OraSure Technologies': /orasure/i,
  Medtronic: /medtronic/i,
  Haemonetics: /haemonetics/i,
  'PTS Diagnostics': /polymer technology|pts diagnostics/i,
  Qualigen: /qualigen/i,
  bioMérieux: /biomerieux|biofire/i,
  Credo: /credo/i,
  LumiraDx: /lumiradx/i,
  Arkray: /arkray/i,
  Acon: /acon lab/i,
  'EKF Diagnostics': /ekf|stanbio/i,
  Horiba: /horiba|abx/i,
  'Thermo Fisher': /thermo fisher|life technologies|applied biosystems|invitrogen/i,
  'SD Biosensor': /sd biosensor/i,
  'CTK Biotech': /ctk biotech/i,
  InBios: /inbios/i,
  Calbiotech: /calbiotech/i,
  'Premier Medical': /premier medical/i,
  'Precision Biosensor': /precision biosensor/i,
  Mindray: /mindray/i,
  'Nihon Kohden': /nihon kohden/i,
  Fujifilm: /fujifilm/i,
  Diesse: /diesse/i,
  DiaSys: /diasys/i,
  Qiagen: /qiagen/i,
  Bosch: /bosch/i,
  'Silver Lake Research': /silver lake/i,
  Getein: /getein/i,
  Boditech: /boditech/i,
  Wondfo: /wondfo/i,
  'Universal Biosensors': /universal biosensors/i,
  iHealth: /ihealth|andon/i,
};

/** Brands most likely to be in GUDID (US-marketed IVDs) are queried first. */
export const US_PRIORITY = [
  'Abbott',
  'Roche',
  'Siemens Healthineers',
  'Becton Dickinson',
  'Cepheid',
  'QuidelOrtho',
  'Sysmex',
  'Nova Biomedical',
  'Radiometer',
  'HemoCue',
  'Werfen',
  'Bio-Rad',
  'Meridian Bioscience',
  'OraSure Technologies',
  'Medtronic',
  'Haemonetics',
  'PTS Diagnostics',
  'Qualigen',
  'bioMérieux',
  'Thermo Fisher',
  'LumiraDx',
  'Arkray',
  'Acon',
  'EKF Diagnostics',
  'Horiba',
  'Credo',
  'Qiagen',
  'Calbiotech',
  'InBios',
  'CTK Biotech',
];

const GENERIC = new Set([
  'test',
  'kit',
  'card',
  'strip',
  'rapid',
  'device',
  'system',
  'one',
  'step',
  'the',
  'for',
  'and',
  'with',
  'human',
  'whole',
  'blood',
  'panel',
  'plus',
  'cassette',
  'professional',
  'use',
  'analyzer',
  'analyser',
  'reagent',
  'assay',
  'detection',
  'qualitative',
  'quantitative',
  'in',
  'of',
  'total',
  'oral',
  'fluid',
  'collection',
  'specimen',
  'sample',
  'solution',
  'complete',
  'new',
  'standard',
]);
const CONTROLISH =
  /\b(control|controls|calibrat\w*|verification|quality control|linearity|proficiency|tray pack|swab pack)\b/i;
/** Plausible manufacturer reference: letters/digits with . - / _ separators, no prose. */
const CAT_FORMAT = /^[A-Za-z0-9][A-Za-z0-9.\-/_]{1,23}$/;

export const tokens = (s: string) =>
  new Set(
    dedupeKey(s, null)
      .split(' ')
      .filter((t) => (t.length > 1 || /^\d$/.test(t)) && !GENERIC.has(t)),
  );

/** Large lab platforms: a record from one only matches a product that names it. */
const LAB_PLATFORMS =
  /\b(architect|alinity|cobas|atellica|dimension|vitros|immulite|advia|centaur|unicel|dxi|liaison|elecsys)\b/i;
const CONSUMABLE_WORDS =
  /\b(cuvettes?|cartridges?|strips?|reagents?|test kit|snappak|discs?|calibrators?|controls?)\b/i;
const INSTRUMENT_WORDS = /\b(analy[sz]er|instrument|meter|reader|system)\b/i;

/** Distinctive words of the product used in the query (max 3). */
export function queryWords(p: Pick<Product, 'name' | 'product_line'>): string[] {
  return [...tokens(`${p.product_line ?? ''} ${p.name}`)]
    .filter((w) => w.length > 2 && !/^\d+$/.test(w))
    .slice(0, 3);
}

export function buildQuery(words: string[]): string {
  return words
    .map(
      (w) => `(brand_name:${encodeURIComponent(w)}+OR+device_description:${encodeURIComponent(w)})`,
    )
    .join('+AND+');
}

export function matchRecords(
  p: Product,
  records: GudidRecord[],
  query: string | null,
): EnrichmentEntry {
  const company = p.brand
    ? (COMPANY_PATTERNS[p.brand] ?? new RegExp(p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
    : null;
  const want = tokens(`${p.product_line ?? ''} ${p.name}`);
  const isControl =
    p.subtype === 'control' || p.subtype === 'calibrator' || CONTROLISH.test(p.name);
  const scored = records
    .filter((r) => company && company.test(r.company_name ?? ''))
    .filter(
      (r) => isControl || !CONTROLISH.test(`${r.brand_name ?? ''} ${r.device_description ?? ''}`),
    )
    .filter((r) => {
      const text = `${r.brand_name ?? ''} ${r.device_description ?? ''}`;
      const platform = text.match(LAB_PLATFORMS)?.[0];
      if (platform && !new RegExp(platform, 'i').test(`${p.product_line ?? ''} ${p.name}`))
        return false;
      // A panel record (several analytes) is not a single-analyte product.
      if (/\bpanel\b/i.test(r.brand_name ?? '') && !/\bpanel\b/i.test(p.name)) return false;
      if (
        p.product_type === 'instrument' &&
        CONSUMABLE_WORDS.test(text) &&
        !INSTRUMENT_WORDS.test(r.brand_name ?? '')
      )
        return false;
      if (
        p.product_type === 'reagent' &&
        INSTRUMENT_WORDS.test(r.brand_name ?? '') &&
        !CONSUMABLE_WORDS.test(text)
      )
        return false;
      return true;
    })
    .map((r) => {
      const have = tokens(
        `${r.brand_name ?? ''} ${r.device_description ?? ''} ${r.version_or_model_number ?? ''}`,
      );
      let hit = 0;
      for (const t of want) if (have.has(t)) hit++;
      return {
        catalogue_no: (r.catalog_number || r.version_or_model_number || '').trim(),
        di: r.identifiers?.find((i) => i.type === 'Primary')?.id ?? null,
        brand_name: r.brand_name ?? '',
        description: (r.device_description ?? '').slice(0, 200),
        company: r.company_name ?? '',
        score: want.size ? hit / want.size : 0,
      };
    })
    .filter((x) => CAT_FORMAT.test(x.catalogue_no))
    .sort((a, b) => b.score - a.score);
  const best = scored[0]?.score ?? 0;
  const top = best >= 1 ? scored.filter((x) => x.score === best) : [];
  const cats = [...new Set(top.map((x) => x.catalogue_no))];
  // Pack-size variants: same device text once counts/pack words are removed.
  const stem = (d: string) =>
    d
      .toLowerCase()
      .replace(/\(?\d+\s*(tests?|t|pk|pack|count|ct|cartridges?|strips?|devices?|kits?)\)?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const sameDevice =
    new Set(top.map((x) => `${x.brand_name.toLowerCase()}|${stem(x.description)}`)).size === 1;
  // A one-word name ("Glucose") is too generic to auto-accept: send to review.
  if (cats.length && want.size < 2) {
    return {
      status: 'ambiguous',
      catalogue_no: null,
      candidates: top.slice(0, 6),
      query,
      checked_at: new Date().toISOString(),
    };
  }
  const status: EnrichmentEntry['status'] = !cats.length
    ? 'none'
    : cats.length === 1
      ? 'match'
      : sameDevice && cats.length <= 4
        ? 'match-variants'
        : 'ambiguous';
  return {
    status,
    catalogue_no:
      status === 'match' ? cats[0]! : status === 'match-variants' ? cats.sort().join(', ') : null,
    candidates: (top.length ? top : scored).slice(0, 6),
    query,
    checked_at: new Date().toISOString(),
  };
}
