import { describe, expect, it } from 'vitest';
import { missingFields, nearDuplicates, requiredFields } from './audit.ts';
import type { Product } from '../core/types.ts';

const base: Product = {
  id: 'x',
  slug: 'x',
  name: 'Widget HIV Rapid Test',
  brand: 'Acme',
  product_line: null,
  category: 'rapid-tests',
  subcategory: 'reagent',
  technology: 'rdt',
  analyte: ['hiv'],
  sample_type: ['whole-blood'],
  product_type: 'reagent',
  subtype: null,
  pack_size: { value: 25, unit: 'tests', raw: '25T' },
  catalogue_no: 'A-1',
  specs: { a: '1', b: '2' },
  summary: 's',
  image_local: null,
  documents: [],
  related: [],
  source_count: 1,
  duplicate_of: null,
  classification_confidence: 1,
  updated_at: '2026-11-25',
};

describe('audit', () => {
  it('required fields depend on product type', () => {
    expect(requiredFields(base)).toContain('pack_size');
    expect(requiredFields({ ...base, product_type: 'instrument' })).not.toContain('pack_size');
    expect(requiredFields({ ...base, product_type: 'instrument' })).not.toContain('sample_type');
  });
  it('lists missing fields', () => {
    expect(missingFields(base)).toEqual([]);
    expect(
      missingFields({
        ...base,
        catalogue_no: null,
        pack_size: null,
        category: 'general',
        specs: { a: '1' },
      }).sort(),
    ).toEqual(['catalogue_no', 'category', 'pack_size', 'specs']);
  });
  it('finds near-duplicates but not different SKUs or instrument vs reagent', () => {
    const a = { ...base, id: 'a', name: 'Widget HIV 1/2 Rapid Test', catalogue_no: null };
    const b = { ...base, id: 'b', name: 'Widget HIV 1 2 Rapid Test Kit', catalogue_no: null };
    const c = { ...base, id: 'c', name: 'Widget HIV 1/2 Rapid Test', catalogue_no: 'Z-9' };
    const d = { ...base, id: 'd', name: 'Widget HIV 1/2 Rapid Test', catalogue_no: 'Z-8' };
    const pairs = nearDuplicates([a, b, c, d]).map(([x, y]) => [x.id, y.id].sort().join('+'));
    expect(pairs).toContain('a+b');
    expect(pairs).not.toContain('c+d');
  });
});
