/** Offline tests against scrubbed fixtures (regenerate with scripts/make-fixture-nuxt.ts). */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import createAdapter from './adapter.ts';
import { flatten, unflatten } from './devalue.ts';
import { createLogger } from '../../core/log.ts';
import { RawProductSchema, type NavEntry } from '../../core/types.ts';

const BASE = 'https://src-b.example';
const fx = (name: string) => readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8');
const adapter = createAdapter({ id: 'src-b', baseUrl: BASE, enabled: true, priority: 20 });
const parse = (file: string, slug: string) => {
  const entry: NavEntry = {
    category: 'Uncategorised',
    subcategory: null,
    name: slug,
    url: `${BASE}/products/${slug}`,
  };
  return RawProductSchema.parse({
    ...adapter.parseProduct(fx(`${file}.html`), entry),
    fetched_at: '2026-11-25T00:00:00.000Z',
  });
};

describe('devalue', () => {
  it('round-trips nested data with shared references and wrapper tags', () => {
    const shared = { a: 1 };
    const v = { x: [shared, shared], s: 'é', n: null, b: false };
    expect(unflatten(flatten(v))).toEqual(v);
    expect(unflatten('[["Reactive",1],{"k":2},"v"]')).toEqual({ k: 'v' });
  });
});

describe('src-b discover', () => {
  it('reads the sitemap index, then child sitemaps, keeping only own /products/{slug} URLs', async () => {
    const files: Record<string, string> = {
      [`${BASE}/sitemap_index.xml`]: fx('sitemap-index.xml'),
      [`${BASE}/__sitemap__/de.xml`]: fx('sitemap-child.xml'),
    };
    const got: string[] = [];
    const ctx = {
      log: createLogger('t', { silent: true }),
      get: async (url: string) => {
        got.push(url);
        if (!files[url]) throw new Error(`unexpected ${url}`);
        return { url, status: 200, body: files[url]!, fromCache: true };
      },
    };
    const nav = await adapter.discover(ctx);
    expect(got).toEqual([`${BASE}/sitemap_index.xml`, `${BASE}/__sitemap__/de.xml`]);
    expect(nav).toHaveLength(5);
    expect(nav.every((e) => e.url.startsWith(`${BASE}/products/`))).toBe(true);
    expect(nav.map((e) => e.url)).not.toContain(`${BASE}/products`);
    expect(nav[0]!.name).toBe('abl9-blutgasanalysator');
  });
});

describe('src-b product pages', () => {
  it('analyser: manufacturer, categories, typed attributes with units, one child test', () => {
    const p = parse('analyser', 'xprecia-stride-coagulation-analyzer');
    expect(p.source_id).toBe('101');
    expect(p.name).toBe('Xprecia Stride');
    expect(p.brand).toBe('UNIVERSAL BIOSENSORS'); // OEM as stated by the source — reconciled in normalise
    expect(p.category).toBe('Einzelparameter-Geräte');
    expect(p.subcategory).toBe('Gerätetyp');
    expect(p.catalogue_no).toBeNull();
    expect(p.specs).toMatchObject({
      Parameter: 'PT/INR',
      Methode: 'Einzelparameter',
      'Depth (cm)': '4',
      'Weight (kg)': '0.3',
    });
    expect(p.facts).toMatchObject({ Manufacturer: 'UNIVERSAL BIOSENSORS', Parameter: 'PT/INR' });
    expect(p.components).toEqual([
      {
        source_id: expect.any(String),
        name: 'PT/INR Test Strips',
        specs: { Parameter: 'PT/INR', Probentyp: 'Blut' },
      },
    ]);
    expect(p.related_source_ids).toHaveLength(5);
    expect(p.image).toMatch(/^https:\/\/src-b-api\.example\//);
  });

  it('rapid test: multi-value parameter and no instrument dimensions', () => {
    const p = parse('rapid-test', 'zikv-denv-chikv-fast-quad');
    expect(p.brand).toBe('SD BIOSENSOR');
    expect(p.specs['Parameter']).toBe('Chikungunyavirus, Dengue');
    expect(p.specs['Methode']).toBe('Schnelltest');
    expect(p.components[0]!.specs).toMatchObject({ Probentyp: 'Plasma, Serum, Blut' });
  });

  it('PCR system: six assays as components, studies and manuals as documents', () => {
    const p = parse('pcr', 'vitapcr');
    expect(p.brand).toBe('CREDO');
    expect(p.components.map((c) => c.name)).toContain('Strep A Assay');
    expect(p.components).toHaveLength(6);
    const types = new Set(p.documents.map((d) => d.type));
    expect(types.has('study')).toBe(true);
    expect(p.documents.every((d) => !/src-b/.test(d.url))).toBe(true);
  });

  it('urine reader: datasheet PDF typed as pdf, eight strip components', () => {
    const p = parse('urine-reader', 'urisys-1100-system');
    expect(p.brand).toBe('ROCHE');
    expect(p.components).toHaveLength(8);
    expect(p.documents.some((d) => d.type === 'pdf' && d.url.endsWith('.pdf'))).toBe(true);
    expect(p.specs['Konnektivität']).toBe('LAN, WLAN');
  });

  it('culture test: methods only, no parameters', () => {
    const p = parse('culture-test', 'uricult-3');
    expect(p.name).toBe('Uricult Trio');
    expect(p.specs['Parameter']).toBeUndefined();
    expect(p.specs['Methode']).toBe('Resistenztestung, Harnanalyse, Schnelltest');
  });

  it('fails clearly on a page without a product payload', () => {
    expect(() =>
      adapter.parseProduct('<html><body>nope</body></html>', {
        category: 'x',
        name: 'x',
        url: `${BASE}/products/x`,
      }),
    ).toThrow(/NUXT_DATA/);
  });
});
