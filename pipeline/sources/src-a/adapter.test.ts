/** Offline selector tests against scrubbed fixtures (regenerate with scripts/make-fixture.ts). */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import createAdapter, { parseNav } from './adapter.ts';
import { RawProductSchema, type NavEntry } from '../../core/types.ts';

const BASE = 'https://src-a.example';
const fx = (name: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', `${name}.html`), 'utf8');
const adapter = createAdapter({ id: 'src-a', baseUrl: BASE, enabled: true, priority: 10 });
const parse = (name: string, slugId: string, category = 'Nav Category') => {
  const entry: NavEntry = {
    category,
    subcategory: null,
    name: 'Nav Name',
    url: `${BASE}/${slugId}.html`,
  };
  const p = adapter.parseProduct(fx(name), entry);
  return RawProductSchema.parse({ ...p, fetched_at: '2026-11-24T00:00:00.000Z' });
};

describe('src-a nav', () => {
  const nav = parseNav(fx('nav'), `${BASE}/`);
  it('finds every category under "Our Business" with its products', () => {
    const cats = [...new Set(nav.map((e) => e.category))];
    expect(cats).toEqual([
      'Medical IVD',
      'Medical RTD',
      'Medical ELISA',
      'Medical POCT',
      'Medical FIA',
      'Medical CLIA',
      'Medical Analyzer',
      'Medical LAB',
      'Medical Reagents',
      'Medical Accesories',
      'Medical Consumables',
      'Medical Surgicals',
      'Life Sciences',
    ]);
    expect(nav).toHaveLength(13 * 3); // fixture keeps 3 products per category
  });
  it('builds absolute product URLs and ignores non-product links', () => {
    expect(nav[0]).toEqual({
      category: 'Medical IVD',
      subcategory: null,
      name: 'Abbott BINAXNOW LEGIONELLA URINARY ANTIGEN CARD',
      url: `${BASE}/abbott-binaxnow-legionella-urinary-antigen-card-1000001.html`,
    });
    expect(nav.every((e) => /-\d+\.html$/.test(e.url))).toBe(true);
  });
});

describe('src-a product pages', () => {
  it('rapid test: name, breadcrumb category, fact table, specs, image', () => {
    const p = parse('rapid-test', 'abbott-bioline-hbsag-1000041');
    expect(p.source_id).toBe('1000041');
    expect(p.name).toBe('Abbott Bioline HBsAg');
    expect(p.category).toBe('Medical IVD');
    expect(p.brand).toBe('Abbott');
    expect(p.catalogue_no).toBe('01FK10');
    expect(p.facts).toEqual({
      Brand: 'Abbott',
      'Sample Type': 'Serum/ Plasma',
      'Pack Size': '30T',
      'CAT No': '01FK10',
    });
    expect(p.specs['Technology']).toBe('Lateral Flow Immunoassay');
    expect(p.specs['Interpretation Time']).toBe('15-20 minutes');
    expect(p.specs['Minimum Order Quantity']).toBeUndefined(); // commercial block skipped
    expect(Object.keys(p.specs).length).toBeGreaterThan(20);
    expect(p.image).toMatch(/^https:\/\/img-cdn\.example\/1000041\//);
    expect(p.description_raw).toMatch(/^Bioline Hepatitis tests/);
    expect(p.description_raw).not.toMatch(/FAQ|Trimmed/);
  });

  it('ELISA kit: keeps the stated brand even when it disagrees with the name', () => {
    const p = parse('elisa', 'calbiotech-free-testosterone-elisa-1000008');
    expect(p.name).toBe('Calbiotech Free Testosterone ELISA');
    expect(p.category).toBe('Medical ELISA');
    expect(p.brand).toBe('InBios'); // source data error — resolved in normalise, not here
    expect(p.catalogue_no).toBe('FT178S');
    expect(p.facts['Pack Size']).toBe('96 Wells');
  });

  it('analyser: no spec list, fact table with model', () => {
    const p = parse('analyser', 'mindray-clinical-chemistry-analyzer-bs-230-1000019');
    expect(p.category).toBe('Medical Analyzer');
    expect(p.brand).toBe('Mindray');
    expect(p.catalogue_no).toBe('BS-230');
    expect(p.facts).toMatchObject({
      Model: 'BS-230',
      Capacity: '200 Test/Hr',
      Application: 'Biochemistry',
    });
    expect(p.specs).toEqual({});
  });

  it('consumable: no fact table → nulls, never guesses', () => {
    const p = parse('consumable', 'qiagen-filter-tips-1000-l-1000032');
    expect(p.name).toBe('Qiagen Filter-Tips, 1000 l');
    expect(p.category).toBe('Medical Consumables');
    expect(p.brand).toBeNull();
    expect(p.catalogue_no).toBeNull();
    expect(p.facts).toEqual({});
  });

  it('control: "CAT No." variant, specs merged from details list', () => {
    const p = parse('control', 'edan-i15-control-level-1-1000050');
    expect(p.name).toBe('EDAN i15 control level -1');
    expect(p.catalogue_no).toBe('83.67.241310');
    expect(p.facts['Application']).toBe('Control');
    expect(p.specs['Usage Type']).toBe('Hospital and Lab');
  });

  it('rejects URLs without a record id', () => {
    expect(() =>
      adapter.parseProduct(fx('control'), { category: 'x', name: 'x', url: `${BASE}/about.html` }),
    ).toThrow(/record id/);
  });
});
