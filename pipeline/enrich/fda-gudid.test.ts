import { describe, expect, it } from 'vitest';
import { matchRecords, queryWords } from './fda-gudid.ts';
import type { Product } from '../core/types.ts';

const p = (o: Partial<Product>): Product => ({
  id: 'x',
  slug: 'x',
  name: 'CG8+',
  brand: 'Abbott',
  product_line: 'i-STAT',
  category: 'blood-gas',
  subcategory: 'reagent',
  technology: 'blood-gas',
  analyte: [],
  sample_type: [],
  product_type: 'reagent',
  subtype: 'cartridge',
  pack_size: null,
  catalogue_no: null,
  specs: {},
  summary: null,
  image_local: null,
  documents: [],
  related: [],
  source_count: 1,
  duplicate_of: null,
  classification_confidence: 1,
  updated_at: '2026-11-25',
  ...o,
});
const rec = (company: string, brand: string, desc: string, cat: string) => ({
  company_name: company,
  brand_name: brand,
  device_description: desc,
  catalog_number: cat,
  identifiers: [{ id: 'DI' + cat, type: 'Primary' }],
});

describe('FDA GUDID matching', () => {
  it('uses distinctive words only', () => {
    expect(queryWords(p({ name: 'BinaxNOW COVID-19 Ag Card', product_line: 'BinaxNOW' }))).toEqual(
      expect.arrayContaining(['binaxnow', 'covid19']),
    );
  });
  it('accepts a single full match from the brand’s companies', () => {
    const e = matchRecords(
      p({}),
      [
        rec('ABBOTT POINT OF CARE INC.', 'i-STAT', 'CG8+ CARTRIDGE', '03P88-25'),
        rec('Other Co', 'i-STAT', 'CG8+ CARTRIDGE', 'X1'),
      ],
      'q',
    );
    expect(e).toMatchObject({ status: 'match', catalogue_no: '03P88-25' });
    expect(e.candidates[0]!.di).toBe('DI03P88-25');
  });
  it('groups pack-size variants of one device', () => {
    const e = matchRecords(
      p({ name: 'CG4+' }),
      [
        rec('Abbott Point of Care', 'i-STAT', 'CARTRIDGE, CG4+ (25 cartridges)', '03P85-25'),
        rec('Abbott Point of Care', 'i-STAT', 'CARTRIDGE, CG4+ (50 cartridges)', '03P85-50'),
      ],
      'q',
    );
    expect(e).toMatchObject({ status: 'match-variants', catalogue_no: '03P85-25, 03P85-50' });
  });
  it('never matches controls to a test, and flags different devices as ambiguous', () => {
    const ctl = matchRecords(
      p({ name: 'Legionella', product_line: 'BinaxNOW' }),
      [
        rec(
          'Alere Scarborough',
          'BinaxNOW Legionella Control Swab Pack',
          'Control swabs',
          '852-010',
        ),
      ],
      'q',
    );
    expect(ctl.status).toBe('none');
    const amb = matchRecords(
      p({ name: 'Basic Metabolic Panel', product_line: 'Piccolo' }),
      [
        rec('Abaxis', 'Piccolo Basic Metabolic Panel', 'Reagent disc A', '400-0024'),
        rec(
          'Abaxis',
          'Piccolo Basic Metabolic Panel Plus',
          'Reagent disc B for other analytes',
          '400-0031',
        ),
      ],
      'q',
    );
    expect(amb.status).toBe('ambiguous');
  });
  it('requires every distinctive word', () => {
    expect(
      matchRecords(
        p({ name: 'Chem8+' }),
        [rec('Abbott Point of Care', 'i-STAT', 'CARTRIDGE, CG8+', '1')],
        'q',
      ).status,
    ).toBe('none');
  });

  it('sends one-word names to review and rejects calibrators and malformed numbers', () => {
    expect(
      matchRecords(
        p({ name: 'Glucose', brand: 'Arkray', product_line: null, subtype: null }),
        [rec('Arkray USA', 'GLUCOCARD Expression', 'Blood glucose meter', '570001')],
        'q',
      ).status,
    ).toBe('ambiguous');
    expect(
      matchRecords(
        p({ name: 'TSH Assay', brand: 'Qualigen', product_line: null, subtype: null }),
        [rec('Qualigen', 'Calibrator Kit – TSH Assay', '', '25000024')],
        'q',
      ).status,
    ).toBe('none');
    expect(
      matchRecords(
        p({ name: 'QStat Cartridge', brand: 'Qualigen', product_line: null, subtype: null }),
        [rec('Qualigen', 'QStat Cartridge', '', 'QStat Cartridge KIT\n(Box)')],
        'q',
      ).status,
    ).toBe('none');
  });

  it('keeps model digits, respects product type and lab platforms', () => {
    expect(
      matchRecords(
        p({
          name: 'Clinitek Microalbumin 9',
          brand: 'Siemens Healthineers',
          product_line: null,
          subtype: null,
        }),
        [
          rec(
            'Siemens Healthcare Diagnostics',
            'CLINITEK Microalbumin 2 Reagent Strips',
            '',
            'A2083C24',
          ),
        ],
        'q',
      ).status,
    ).toBe('none');
    expect(
      matchRecords(
        p({
          name: 'Avoximeter 1000E',
          brand: 'Werfen',
          product_type: 'instrument',
          product_line: null,
          subtype: null,
        }),
        [
          rec(
            'Accriva Diagnostics',
            'Avoximeter Whole Blood Oximeter',
            'Avoximeter 1000E Cuvettes 100 cuvettes/box',
            'C100B',
          ),
        ],
        'q',
      ).status,
    ).toBe('none');
    expect(
      matchRecords(
        p({ name: 'beta-hCG test', product_line: null, subtype: null }),
        [rec('Abbott Ireland', 'ARCHITECT', 'ARCHITECT Total Beta hCG Reagent Kit', '07K7825')],
        'q',
      ).status,
    ).toBe('none');
  });
});
