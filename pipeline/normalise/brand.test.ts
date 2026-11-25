import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { BrandMatcher, tidyBrandCase, type BrandConfig } from './brand.ts';
import { CONFIG_DIR, loadYaml } from '../core/config.ts';

const m = new BrandMatcher(loadYaml<BrandConfig>(join(CONFIG_DIR, 'brands.yaml')));

describe('brand split', () => {
  it('strips a brand prefix and records the product line', () => {
    expect(m.match('Abbott Bioline HBsAg', 'Abbott')).toMatchObject({
      brand: 'Abbott',
      product_line: 'Bioline',
      name: 'Bioline HBsAg',
      method: 'name',
      conflict: null,
    });
    expect(m.match('SD Biosensor STANDARD Q Dengue IgM/IgG')).toMatchObject({
      brand: 'SD Biosensor',
      product_line: 'STANDARD Q',
      name: 'STANDARD Q Dengue IgM/IgG',
    });
  });

  it('infers the brand from a product line when the name lacks it', () => {
    expect(m.match('STANDARD Q Dengue IgM IgG')).toMatchObject({
      brand: 'SD Biosensor',
      method: 'line',
      product_line: 'STANDARD Q',
    });
    expect(m.match('ichroma CRP')).toMatchObject({ brand: 'Boditech', product_line: 'ichroma' });
    expect(m.match('OnSite HEV IgM Rapid Test')).toMatchObject({ brand: 'CTK Biotech' });
    expect(m.match('Finecare Testosterone Rapid Quantitative Test')).toMatchObject({
      brand: 'Wondfo',
    });
    expect(m.match('First Response Malaria Ag. P.f. P.v. Card Test', 'Premier')).toMatchObject({
      brand: 'Premier Medical',
      conflict: null,
    });
    expect(m.match('Bioline RSV', 'Abbott')).toMatchObject({
      brand: 'Abbott',
      name: 'Bioline RSV',
    });
  });

  it('name beats a disagreeing stated brand, and reports it', () => {
    expect(m.match('Calbiotech Free Testosterone ELISA', 'InBios')).toMatchObject({
      brand: 'Calbiotech',
      conflict: 'InBios',
    });
    expect(m.match('Xprecia Stride', 'UNIVERSAL BIOSENSORS')).toMatchObject({
      brand: 'Siemens Healthineers',
      conflict: 'Universal Biosensors (OEM/distributor)',
    });
  });

  it('falls back to the stated brand, canonicalised or tidied', () => {
    expect(m.match('VitaPCR', 'CREDO')).toMatchObject({ brand: 'Credo' });
    expect(m.match('Urisys 1100', 'ROCHE')).toMatchObject({
      brand: 'Roche',
      product_line: 'Urisys',
      method: 'line',
    });
    expect(m.match('Some Meter', 'ZEPHYRMED')).toMatchObject({
      brand: 'Zephyrmed',
      method: 'stated',
      unknownStated: 'ZEPHYRMED',
    });
    expect(m.match('Human Parvovirus B19 Assay', 'Ustar')).toMatchObject({
      brand: 'Ustar',
      conflict: null,
    });
  });

  it('never guesses when there is nothing to go on', () => {
    expect(m.match('Filter-Tips, 1000 µl')).toMatchObject({
      brand: null,
      method: 'none',
      name: 'Filter-Tips, 1000 µl',
    });
  });

  it('strips doubled brand prefixes', () => {
    expect(m.match('HemoTypeSC HemoTypeSC Sickle Cell Disease').name).toBe('Sickle Cell Disease');
  });

  it('tidies all-caps brands but keeps short acronyms', () => {
    expect(tidyBrandCase('SD BIOSENSOR')).toBe('SD Biosensor');
    expect(tidyBrandCase('EDAN')).toBe('EDAN');
    expect(tidyBrandCase('Mindray')).toBe('Mindray');
  });
});
