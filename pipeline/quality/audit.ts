/**
 * Data-quality audit over the built catalogue. Produces:
 *   docs/data-quality-report.md  — brand verification, sanity checks, dedupe, missing data
 *   docs/missing-data.csv        — one row per incomplete listing with its missing fields
 * Brand verification resolves each brand's official domain (DNS only, no HTTP);
 * results are cached in data/brand-verification.json so the audit also runs offline.
 */
import { promises as dns } from 'node:dns';
import type { Product } from '../core/types.ts';
import type { BuildReport } from '../normalise/merge.ts';
import type { BrandConfig } from '../normalise/brand.ts';
import { dedupeKey } from '../normalise/dedupe.ts';

export interface BrandCheck {
  brand: string;
  website: string | null;
  resolves: boolean | null;
  note: string | null;
  checked_at: string;
}

export interface AuditInput {
  products: Product[];
  report: BuildReport | null;
  duplicates: { duplicate_groups: unknown[]; cross_source_merges: unknown[] } | null;
  brands: BrandConfig & {
    brands: (BrandConfig['brands'][number] & { website?: string | null; verification?: string })[];
  };
  /** product id → sources (private provenance), optional */
  sourcesOf?: (id: string) => string[];
  brandChecks: Map<string, BrandCheck>;
}

/** Fields a complete listing should have, by product type. */
export function requiredFields(p: Product): string[] {
  const base = ['brand', 'category', 'technology', 'summary', 'specs'];
  if (p.product_type === 'instrument') return [...base, 'analyte', 'catalogue_no'];
  if (p.product_type === 'consumable') return [...base, 'catalogue_no', 'pack_size'];
  return [...base, 'product_type', 'analyte', 'sample_type', 'catalogue_no', 'pack_size'];
}

export function missingFields(p: Product): string[] {
  const has: Record<string, boolean> = {
    brand: !!p.brand,
    category: !!p.category && p.category !== 'general',
    technology: !!p.technology,
    summary: !!p.summary,
    specs: Object.keys(p.specs).length >= 2,
    product_type: !!p.product_type,
    analyte: p.analyte.length > 0,
    sample_type: p.sample_type.length > 0,
    catalogue_no: !!p.catalogue_no,
    pack_size: !!p.pack_size,
  };
  return requiredFields(p).filter((f) => !has[f]);
}

export async function checkBrands(
  brands: AuditInput['brands']['brands'],
  inUse: Set<string>,
  cache: Map<string, BrandCheck>,
  opts: { refresh: boolean; offline: boolean },
): Promise<Map<string, BrandCheck>> {
  const out = new Map<string, BrandCheck>();
  for (const b of brands) {
    if (!inUse.has(b.name)) continue;
    const prev = cache.get(b.name);
    const website = b.website ?? null;
    if (prev && prev.website === website && !opts.refresh) {
      out.set(b.name, { ...prev, note: b.verification ?? null });
      continue;
    }
    let resolves: boolean | null = null;
    if (website && !opts.offline) {
      try {
        await Promise.race([
          dns.lookup(website),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
        ]);
        resolves = true;
      } catch {
        try {
          await dns.lookup(`www.${website}`);
          resolves = true;
        } catch {
          resolves = false;
        }
      }
    }
    out.set(b.name, {
      brand: b.name,
      website,
      resolves,
      note: b.verification ?? null,
      checked_at: new Date().toISOString(),
    });
  }
  return out;
}

const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : '–');
const csvEsc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Same brand, near-identical names, not already flagged as duplicates → review list. */
export function nearDuplicates(products: Product[]): [Product, Product, number][] {
  const live = products.filter((p) => !p.duplicate_of);
  const byBrand = new Map<string, Product[]>();
  for (const p of live)
    if (p.brand) (byBrand.get(p.brand) ?? byBrand.set(p.brand, []).get(p.brand)!).push(p);
  const out: [Product, Product, number][] = [];
  for (const list of byBrand.values()) {
    const keys = list.map((p) => new Set(dedupeKey(p.name, p.brand).split(' ').filter(Boolean)));
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const A = keys[i]!;
        const B = keys[j]!;
        if (A.size < 2 || B.size < 2) continue;
        let inter = 0;
        for (const t of A) if (B.has(t)) inter++;
        const sim = inter / (A.size + B.size - inter);
        const typesClash =
          list[i]!.product_type &&
          list[j]!.product_type &&
          list[i]!.product_type !== list[j]!.product_type;
        const differentSku =
          list[i]!.catalogue_no &&
          list[j]!.catalogue_no &&
          list[i]!.catalogue_no !== list[j]!.catalogue_no;
        if (sim >= 0.8 && !typesClash && !differentSku) out.push([list[i]!, list[j]!, sim]);
      }
  }
  return out.sort((a, b) => b[2] - a[2]);
}

export function buildAudit(input: AuditInput): { markdown: string; csv: string } {
  const all = input.products;
  const live = all.filter((p) => !p.duplicate_of);
  const r = input.report;
  const lines: string[] = [];
  const h = (t: string) => lines.push('', t, '');
  const row = (...c: (string | number)[]) => lines.push(`| ${c.join(' | ')} |`);

  // ---- Summary
  const incomplete = live.filter((p) => missingFields(p).length);
  lines.push(
    '# Data quality report',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} from \`data/products.json\`.`,
  );
  h('## Summary');
  row('Metric', 'Value');
  row('---', '---:');
  row('Listings (records)', all.length);
  row('Canonical products', live.length);
  row('Flagged duplicate listings (hidden, redirect)', all.length - live.length);
  row('Duplicate groups', input.duplicates?.duplicate_groups.length ?? 0);
  row('Cross-source merges', input.duplicates?.cross_source_merges.length ?? 0);
  row(
    'Complete listings (all required fields)',
    `${live.length - incomplete.length} (${pct(live.length - incomplete.length, live.length)})`,
  );
  row('Incomplete listings', `${incomplete.length} (${pct(incomplete.length, live.length)})`);
  const coreIncomplete = live.filter((p) =>
    missingFields(p).some((f) => f !== 'catalogue_no' && f !== 'pack_size'),
  );
  row(
    'Complete on core facts (ignoring catalogue no. & pack size)',
    `${live.length - coreIncomplete.length} (${pct(live.length - coreIncomplete.length, live.length)})`,
  );
  const brandsInUse = new Set(live.map((p) => p.brand).filter((b): b is string => !!b));
  const checks = [...input.brandChecks.values()];
  row('Brands in catalogue', brandsInUse.size);
  const confirmed = (c: BrandCheck) => c.resolves || (!!c.note && /confirmed/i.test(c.note));
  row(
    'Brands verified (domain resolves or confirmed by web search)',
    checks.filter(confirmed).length,
  );
  row(
    'Brands not verified',
    `${checks.filter((c) => !confirmed(c)).length}${
      checks.some((c) => !confirmed(c))
        ? ' — ' +
          checks
            .filter((c) => !confirmed(c))
            .map((c) => c.brand)
            .join(', ')
        : ''
    }`,
  );

  // ---- Brands
  h('## Brand / company verification');
  lines.push(
    'Each brand is mapped to its official website domain in `pipeline/config/brands.yaml`; the audit checks that the domain resolves (DNS only — no requests to the company). Brands without a confirmed domain are listed with how they were checked.',
    '',
  );
  row('Brand', 'Products', 'Official domain', 'Status', 'Note');
  row('---', '---:', '---', '---', '---');
  const counts = new Map<string, number>();
  for (const p of live) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  const rank = (c: BrandCheck) => (c.resolves ? 2 : c.note && /confirmed/i.test(c.note) ? 1 : 0);
  for (const c of checks.sort(
    (a, b) => rank(a) - rank(b) || (counts.get(b.brand) ?? 0) - (counts.get(a.brand) ?? 0),
  )) {
    const status = c.resolves
      ? '✅ verified (domain resolves)'
      : c.note && /confirmed/i.test(c.note)
        ? '✅ confirmed (web search)'
        : c.website
          ? '⚠️ domain did not resolve here'
          : '❌ unverified';
    row(c.brand, counts.get(c.brand) ?? 0, c.website ?? '—', status, c.note ?? '');
  }
  const notInYaml = [...brandsInUse].filter((b) => !input.brandChecks.has(b));
  if (notInYaml.length)
    lines.push('', `Brands used by products but missing from brands.yaml: ${notInYaml.join(', ')}`);
  if (r?.unknownStatedBrands.length)
    lines.push(
      '',
      `Stated brands not in brands.yaml (passed through): ${r.unknownStatedBrands.map((b) => `${b.brand} (${b.count})`).join(', ')}`,
    );
  if (r?.noBrand.length)
    lines.push('', `Products with no brand: ${r.noBrand.map((b) => b.name).join(', ')}`);
  if (r?.brandConflicts.length) {
    lines.push('', 'Name-derived brand differs from the brand the source stated (name wins):', '');
    for (const c of r.brandConflicts)
      lines.push(`- ${c.name}: **${c.brand}** (source: ${c.stated})`);
  }

  // ---- Sanity
  h('## Sanity checks');
  lines.push('Automatic fixes applied in `build-data`, and items left for review.', '');
  lines.push(
    `- **Catalogue-number conflicts** (same brand + number on clearly different products — number withheld on all of them until corrected via \`overrides.yaml\`): ${r?.catalogueConflicts.length ?? 0}`,
  );
  for (const c of r?.catalogueConflicts ?? [])
    lines.push(`  - \`${c.catalogue_no}\` — ${c.names.join(' / ')}`);
  lines.push(
    `- **Sample types removed as contradictory** (e.g. a stool sample for an influenza test): ${r?.sampleContradictions.length ?? 0}`,
  );
  for (const s of r?.sampleContradictions ?? [])
    lines.push(`  - ${s.name}: removed ${s.removed.join(', ')}`);
  lines.push(
    `- **Out of scope (non-diagnostic) dropped**: ${r?.dropped.length ?? 0}${r?.dropped.length ? ' — ' + r.dropped.map((d) => `${d.name} (${d.reason})`).join('; ') : ''}`,
  );
  lines.push(`- **Untranslated (non-English) text**: ${r?.untranslated.length ?? 0}`);
  const cryptic = live.filter((p) => p.name.replace(/[^A-Za-z0-9]/g, '').length <= 2);
  lines.push(
    `- **Very short product names** (≤ 2 letters/digits; shown with brand): ${cryptic.length}${cryptic.length ? ' — ' + cryptic.map((p) => `${p.brand ?? ''} ${p.name}`.trim()).join(', ') : ''}`,
  );
  const multiCat = live.filter((p) => p.catalogue_no && /[,&]/.test(p.catalogue_no));
  lines.push(
    `- **Listings with several catalogue numbers** (pack variants, kept as listed): ${multiCat.length}`,
  );
  lines.push(
    `- **Same-named different products** given a pack-size / Cat. no. suffix: ${r?.sameNameDisambiguated ?? 0}`,
  );
  lines.push(`- **Low classification confidence** (< 0.6): ${r?.lowConfidence.length ?? 0}`);
  for (const l of (r?.lowConfidence ?? []).slice(0, 30))
    lines.push(`  - ${l.name} (${l.confidence})`);

  // ---- Dedupe
  h('## Deduplication');
  lines.push(
    'Listings are grouped by brand + normalised name (spelling, punctuation, plurals, pack sizes, word order ignored). Same brand + same catalogue number also groups spelling variants, unless the names differ in a distinguishing word (IgG/IgM/Ag/Ab/Duo/Combo/Self) or the analytes differ. Instruments and reagents are never merged; different catalogue numbers are never merged.',
    '',
  );
  const near = nearDuplicates(all);
  lines.push(
    `Possible duplicates for review (same brand, ≥ 80% name overlap, same or unknown catalogue number, not merged): **${near.length}**`,
    '',
  );
  if (near.length) {
    row('Product A', 'Product B', 'Overlap');
    row('---', '---', '---:');
    for (const [a, b, s] of near.slice(0, 60))
      row(`\`${a.id}\``, `\`${b.id}\``, `${Math.round(s * 100)}%`);
  }

  // ---- Missing data
  h('## Missing data');
  lines.push(
    'A listing is **complete** when it has every field required for its type. All: brand, category, technology, summary, ≥ 2 spec rows. Tests/reagents also: product type, analyte, sample type, catalogue number, pack size. Instruments also: analyte, catalogue number. Consumables also: catalogue number, pack size.',
    '',
  );
  const fields = [
    'brand',
    'category',
    'technology',
    'summary',
    'specs',
    'product_type',
    'analyte',
    'sample_type',
    'catalogue_no',
    'pack_size',
  ];
  row('Field', 'Required for', 'Missing', '% of those listings');
  row('---', '---:', '---:', '---:');
  for (const f of fields) {
    const req = live.filter((p) => requiredFields(p).includes(f));
    const miss = req.filter((p) => missingFields(p).includes(f));
    row(f, req.length, miss.length, pct(miss.length, req.length));
  }
  const byMissingCount = new Map<number, number>();
  for (const p of live)
    byMissingCount.set(
      missingFields(p).length,
      (byMissingCount.get(missingFields(p).length) ?? 0) + 1,
    );
  lines.push('', 'Listings by number of missing fields:', '');
  row('Missing fields', 'Listings');
  row('---:', '---:');
  for (const [n, c] of [...byMissingCount].sort((a, b) => a[0] - b[0])) row(n, c);

  const group = (label: string, key: (p: Product) => string[]) => {
    const m = new Map<string, { total: number; incomplete: number }>();
    for (const p of live)
      for (const k of key(p)) {
        const e = m.get(k) ?? { total: 0, incomplete: 0 };
        e.total++;
        if (missingFields(p).length) e.incomplete++;
        m.set(k, e);
      }
    h(`### Incomplete listings by ${label}`);
    row(label[0]!.toUpperCase() + label.slice(1), 'Listings', 'Incomplete', '%');
    row('---', '---:', '---:', '---:');
    for (const [k, e] of [...m].sort((a, b) => b[1].incomplete - a[1].incomplete).slice(0, 40))
      row(k, e.total, e.incomplete, pct(e.incomplete, e.total));
  };
  lines.push(
    '',
    'Note: the second source publishes no catalogue numbers or pack sizes, so most of its listings miss exactly those two fields. Add them by hand (`data/manual/`) or from another source to raise completeness.',
  );
  if (input.sourcesOf)
    group('source', (p) => input.sourcesOf!(p.id).map((s) => (s === 'manual' ? 'hand-added' : s)));
  group('category', (p) => [p.category ?? '(none)']);
  group('product type', (p) => [p.subcategory ?? '(unknown)']);
  group('brand', (p) => [p.brand ?? '(no brand)']);

  lines.push(
    '',
    'Full list: [`docs/missing-data.csv`](missing-data.csv) — one row per incomplete listing.',
    '',
  );

  const csv = [
    'id,brand,name,category,product_type,missing_count,missing_fields,url_path',
    ...incomplete
      .map((p) => ({ p, m: missingFields(p) }))
      .sort((a, b) => b.m.length - a.m.length || a.p.id.localeCompare(b.p.id))
      .map(({ p, m }) =>
        [
          p.id,
          p.brand ?? '',
          p.name,
          p.category ?? '',
          p.product_type ?? '',
          String(m.length),
          m.join(' '),
          `/products/${p.slug}/`,
        ]
          .map(csvEsc)
          .join(','),
      ),
  ].join('\n');
  return { markdown: lines.join('\n') + '\n', csv: csv + '\n' };
}
