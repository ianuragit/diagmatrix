import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { build, type BuildInput } from './merge.ts';
import type { BrandConfig } from './brand.ts';
import type { Taxonomy } from './classify.ts';
import { CONFIG_DIR, loadYaml } from '../core/config.ts';
import type { RawProduct } from '../core/types.ts';

const taxonomy = loadYaml<Taxonomy>(join(CONFIG_DIR, 'taxonomy.yaml'));
const brands = loadYaml<BrandConfig>(join(CONFIG_DIR, 'brands.yaml'));
const T = '2026-11-25T00:00:00.000Z';

const raw = (source: string, id: string, o: Partial<RawProduct>): RawProduct => ({
  source,
  source_id: id,
  url: `https://${source}.example/p/${id}`,
  fetched_at: T,
  name: 'x',
  category: null,
  subcategory: null,
  brand: null,
  catalogue_no: null,
  specs: {},
  facts: {},
  image: `https://${source}.example/img/${id}.jpg`,
  documents: [],
  components: [],
  related_source_ids: [],
  description_raw: 'Long marketing copy that must never be published.',
  ...o,
});

function input(o: Partial<BuildInput> = {}): BuildInput {
  return {
    sources: [
      {
        id: 'src-a',
        priority: 10,
        hosts: ['src-a.example'],
        records: [
          raw('src-a', '1', {
            name: 'Abbott Bioline HBsAg',
            category: 'Medical IVD',
            brand: 'Abbott',
            catalogue_no: '01FK10',
            facts: {
              Brand: 'Abbott',
              'Sample Type': 'Serum/ Plasma',
              'Pack Size': '30T',
              'CAT No': '01FK10',
            },
            specs: { 'Wall Mounted': 'No', Technology: 'Lateral Flow Immunoassay' },
          }),
          raw('src-a', '2', {
            name: 'Abbott Bioline HBsAg',
            category: 'Medical IVD',
            brand: 'Abbott',
            catalogue_no: '01FK10',
            facts: { 'Pack Size': '30T' },
          }),
          raw('src-a', '3', {
            name: 'Abbott DETERMINE Syphilis TP',
            category: 'Medical IVD',
            catalogue_no: '7D2443',
          }),
          raw('src-a', '4', {
            name: 'Abbott DETERMINE Syphilis TP SET',
            category: 'Medical IVD',
            catalogue_no: '7D2443SET',
          }),
          raw('src-a', '5', { name: 'Terumo Coronary Guidewire', category: 'Medical Reagents' }),
          raw('src-a', '6', { name: 'Eppendorf Centrifuge 5430', category: 'Medical LAB' }),
        ],
      },
      {
        id: 'src-b',
        priority: 20,
        hosts: ['src-b.example'],
        records: [
          raw('src-b', '100', {
            name: 'Bioline HBsAg',
            brand: 'ABBOTT',
            specs: { Methode: 'Schnelltest', Parameter: 'HBsAg' },
            documents: [
              { title: 'IFU', url: 'https://www.manufacturer.example/ifu.pdf', type: 'pdf' },
              { title: 'Hosted copy', url: 'https://cdn.src-b.example/ifu.pdf', type: 'pdf' },
              { title: 'Study', url: 'https://pubmed.ncbi.nlm.nih.gov/1/', type: 'study' },
            ],
          }),
          raw('src-b', '200', {
            name: 'Urisys 1100',
            brand: 'ROCHE',
            specs: { Methode: 'Reader, Harnanalyse', 'Weight (kg)': '0.8' },
            components: [
              {
                source_id: '201',
                name: 'Combur10',
                specs: { Parameter: 'Glukose, Nitrit, Erythrozyten', Probentyp: 'Urin' },
              },
            ],
          }),
          raw('src-b', '300', {
            name: 'cobas u 411',
            brand: 'ROCHE',
            specs: { Methode: 'Reader', 'Weight (kg)': '6' },
            components: [
              {
                source_id: '301',
                name: 'Combur10',
                specs: { Parameter: 'Glukose', Probentyp: 'Urin' },
              },
            ],
          }),
        ],
      },
    ],
    manual: [
      {
        file: 'extra',
        name: 'Acme QuickCheck CRP',
        brand: 'Acme',
        catalogue_no: 'AC-1',
        pack_size: '25 tests',
        analytes: ['CRP'],
        product_type: 'reagent',
      },
    ],
    brands,
    taxonomy,
    overrides: {},
    idMap: new Map(),
    privateTerms: ['examplesourceco'],
    ...o,
  };
}

describe('build()', () => {
  const out = build(input());
  const byId = new Map(out.products.map((p) => [p.id, p]));

  it('drops non-diagnostic records and reports why', () => {
    expect(out.report.dropped.map((d) => d.reason).sort()).toEqual([
      'keyword "guidewire"',
      'source category "Medical LAB"',
    ]);
  });

  it('flags a same-source duplicate and merges the cross-source listing', () => {
    const hbsag = byId.get('abbott-bioline-hbsag')!;
    expect(hbsag.duplicate_of).toBeNull();
    expect(hbsag.source_count).toBe(3);
    expect(out.provenance['abbott-bioline-hbsag']!.map((r) => r.source).sort()).toEqual([
      'src-a',
      'src-b',
    ]);
    const dup = out.products.find((p) => p.duplicate_of === 'abbott-bioline-hbsag')!;
    expect(dup.id).toMatch(/^abbott-bioline-hbsag-[0-9a-f]{6}$/);
    expect(out.duplicates.duplicate_groups).toHaveLength(1);
    expect(out.duplicates.cross_source_merges).toEqual([
      { id: 'abbott-bioline-hbsag', name: 'Abbott Bioline HBsAg', listings: 2 },
    ]);
    // priority: src-a facts (catalogue, pack) win; classification is filled; filler spec dropped
    expect(hbsag).toMatchObject({
      catalogue_no: '01FK10',
      pack_size: { value: 30, unit: 'tests' },
      technology: 'rdt',
      sample_type: ['serum', 'plasma'],
    });
    expect(hbsag.specs['Wall Mounted']).toBeUndefined();
    expect(hbsag.specs['Method']).toBe('Rapid test');
  });

  it('keeps products with different catalogue numbers apart', () => {
    expect(byId.get('abbott-determine-syphilis-tp')?.duplicate_of).toBeNull();
    expect(byId.get('abbott-determine-syphilis-tp-set')?.duplicate_of).toBeNull();
  });

  it('publishes only manufacturer documents, never source-hosted copies or curated studies', () => {
    expect(byId.get('abbott-bioline-hbsag')!.documents).toEqual([
      { title: 'IFU', url: 'https://www.manufacturer.example/ifu.pdf', type: 'pdf' },
    ]);
  });

  it('expands components once, links them to every parent instrument', () => {
    const strip = byId.get('roche-combur10')!;
    expect(strip).toMatchObject({
      product_type: 'reagent',
      technology: 'urinalysis',
      sample_type: ['urine'],
    });
    expect(strip.analyte).toContain('urine-chemistry');
    expect(strip.analyte).not.toContain('blood-count');
    expect(strip.related).toEqual(
      expect.arrayContaining(['roche-urisys-1100', 'roche-cobas-u-411']),
    );
    expect(byId.get('roche-urisys-1100')!.related).toContain('roche-combur10');
    expect(out.products.filter((p) => p.name === 'Combur10')).toHaveLength(1);
  });

  it('never leaks provenance into public records', () => {
    const json = JSON.stringify(out.products) + JSON.stringify(out.duplicates);
    expect(json).not.toMatch(/src-[ab]\.example|marketing copy|"source_id"|"url":"https:\/\/src/);
  });

  it('hand-added products are first-class', () => {
    expect(byId.get('acme-quickcheck-crp')).toMatchObject({
      brand: 'Acme',
      catalogue_no: 'AC-1',
      analyte: ['crp'],
      product_type: 'reagent',
      source_count: 0,
      pack_size: { value: 25 },
    });
  });

  it('ids are stable across runs and input order; overrides apply last', () => {
    const again = build(
      input({
        idMap: new Map(out.idMap),
        overrides: { 'abbott-bioline-hbsag': { summary: 'Hand-written.' } },
      }),
    );
    expect(again.products.map((p) => p.id)).toEqual(out.products.map((p) => p.id));
    const reversed = input({ idMap: new Map(out.idMap) });
    reversed.sources[0]!.records.reverse();
    expect(
      build(reversed)
        .products.map((p) => p.id)
        .sort(),
    ).toEqual(out.products.map((p) => p.id).sort());
    expect(again.products.find((p) => p.id === 'abbott-bioline-hbsag')!.summary).toBe(
      'Hand-written.',
    );
    expect(again.report.overridesApplied).toEqual(['abbott-bioline-hbsag']);
  });
});
