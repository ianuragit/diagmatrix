import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { Classifier, type ClassifyInput, type Taxonomy } from './classify.ts';
import { CONFIG_DIR, loadYaml } from '../core/config.ts';

const c = new Classifier(loadYaml<Taxonomy>(join(CONFIG_DIR, 'taxonomy.yaml')));
const base: ClassifyInput = {
  source: 'src-a',
  name: '',
  sourceCategories: [],
  methods: [],
  parameters: [],
  samples: [],
  extraText: '',
  isComponent: false,
  hasDimensions: false,
};
const run = (o: Partial<ClassifyInput>) => c.classify({ ...base, ...o });

describe('classify', () => {
  it('rapid test from source category + fact-table samples', () => {
    const r = run({
      name: 'Bioline HBsAg',
      sourceCategories: ['Medical IVD'],
      methods: ['Lateral Flow Immunoassay'],
      samples: ['Serum/ Plasma'],
    });
    expect(r).toMatchObject({
      technology: 'rdt',
      analyte: ['hbsag'],
      sample_type: ['serum', 'plasma'],
      product_type: 'reagent',
      category: 'rapid-tests',
      subcategory: 'reagent',
    });
    expect(r.confidence).toBeGreaterThan(0.8);
  });

  it('German structured values from a POCT directory', () => {
    const r = run({
      source: 'src-b',
      name: 'Xprecia Stride',
      methods: ['Einzelparameter'],
      parameters: ['PT/INR'],
      hasDimensions: true,
    });
    expect(r).toMatchObject({
      technology: 'coagulation',
      analyte: ['pt-inr'],
      product_type: 'instrument',
      category: 'coagulation',
      subcategory: 'instrument',
    });
  });

  it('PCR beats a rapid-test category hint', () => {
    expect(
      run({
        name: 'Truenat COVID 19 Chip based Real Time PCR Test Kit',
        sourceCategories: ['Medical RTD'],
      }),
    ).toMatchObject({
      technology: 'pcr',
      analyte: ['sars-cov-2'],
      product_type: 'reagent',
      category: 'molecular',
    });
  });

  it('controls are reagents with a control subtype', () => {
    const r = run({ name: 'i15 control level -1', sourceCategories: ['Medical POCT'] });
    expect(r).toMatchObject({
      product_type: 'reagent',
      subtype: 'control',
      subcategory: 'control',
    });
  });

  it('components of an instrument are reagents (strips, cartridges)', () => {
    expect(
      run({
        source: 'src-b',
        name: 'Combur10',
        isComponent: true,
        parameters: ['Glukose', 'Nitrit', 'pH'],
        samples: ['Urin'],
      }),
    ).toMatchObject({ product_type: 'reagent', sample_type: ['urine'] });
    expect(run({ name: 'PT/INR Test Strips', isComponent: true })).toMatchObject({
      product_type: 'reagent',
      subtype: 'strip',
    });
  });

  it('analysers and consumables by keyword', () => {
    expect(
      run({ name: 'Clinical Chemistry Analyzer BS-230', sourceCategories: ['Medical Analyzer'] }),
    ).toMatchObject({ product_type: 'instrument', technology: 'clinical-chemistry' });
    expect(
      run({ name: 'Filter-Tips, 1000 µl', sourceCategories: ['Medical Consumables'] }),
    ).toMatchObject({ product_type: 'consumable' });
  });

  it('swab detail wins over generic swab; low confidence when nothing is known', () => {
    expect(run({ samples: ['Nasopharyngeal, Nasal Swab'] }).sample_type).toEqual([
      'nasal-swab',
      'nasopharyngeal-swab',
    ]);
    expect(run({ name: 'Mystery Widget' }).confidence).toBeLessThan(0.5);
  });

  it('suppresses analytes whose words sit inside a more specific one', () => {
    expect(
      run({ name: 'BinaxNOW G6PD', extraText: 'Glucose-6-Phosphate Dehydrogenase deficiency' })
        .analyte,
    ).toEqual(['g6pd']);
  });

  it('scope filter: excluded categories and non-diagnostic keywords', () => {
    expect(c.outOfScope('src-a', ['Medical Surgicals'], 'Anything')).toMatch(/source category/);
    expect(c.outOfScope('src-a', ['Medical Reagents'], 'Coronary Guidewire')).toMatch(/guidewire/);
    expect(c.outOfScope('src-a', ['Medical Reagents'], 'Creatine Kinase reagent kit')).toBeNull();
  });
});
