import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { Translator, repairMojibake, type TranslationConfig } from './translate.ts';
import { CONFIG_DIR, loadYaml } from '../core/config.ts';

const t = new Translator(loadYaml<TranslationConfig>(join(CONFIG_DIR, 'translations.yaml')));

describe('translator', () => {
  it('translates product names, including word-order overrides', () => {
    expect(t.name('PSA gesamt')).toBe('Total PSA');
    expect(t.name('Harnsäure (UA) Einzel-Streifen')).toBe('Uric acid (UA) single strips');
    expect(t.name('Nova MicroSensor Card Harnstoff (BUN), Kreatinin und eGFR')).toBe(
      'Nova MicroSensor Card Urea (BUN), creatinine and eGFR',
    );
    expect(t.name('Teststreifen')).toBe('Test strips');
    expect(t.name('Mikroküvetten')).toBe('Microcuvettes');
    expect(t.name('Total ßhCG')).toBe('Total β-hCG');
  });

  it('leaves English names alone (no partial-word hits)', () => {
    expect(t.name('Urine drug screen cup')).toBe('Urine drug screen cup');
    expect(t.name('Bioline HIV 1/2 3.0')).toBe('Bioline HIV 1/2 3.0');
    expect(t.name('Creatinine Test')).toBe('Creatinine Test');
  });

  it('translates analyte lists item by item', () => {
    expect(t.list('Glukose, Kalium, Kreatinin, Leukozyten (WBC), pH, Spezifisches Gewicht')).toBe(
      'Glucose, Potassium, Creatinine, Leukocytes (WBC), pH, Specific gravity',
    );
    expect(t.list('Harnstoff-Stickstoff (BUN), Hämatokrit')).toBe(
      'Blood urea nitrogen (BUN), Hematocrit',
    );
  });

  it('translates sentences and document titles', () => {
    expect(
      t.text('RS232-Schnittstelle zur LIS-Anbindung vorhanden (unidirektional & bidirektional)'),
    ).toBe('RS232 interface for LIS connection (unidirectional & bidirectional)');
    expect(t.text('Roche Urisys 1100 Datenblatt')).toBe('Roche Urisys 1100 data sheet');
    expect(t.text('Bühlmann Quantum Blue Bedienerhandbuch')).toBe(
      'Bühlmann Quantum Blue operator manual',
    );
  });

  it('detects leftovers but allows brand names', () => {
    expect(t.leftovers('Glukose und Kalium')).toEqual(
      expect.arrayContaining(['Glukose', 'und', 'Kalium']),
    );
    expect(t.leftovers('Bühlmann Quantum Blue operator manual')).toEqual([]);
    expect(t.leftovers('Dräger DrugTest 5000 manual')).toEqual([]);
    expect(t.leftovers('Urine test strips')).toEqual([]);
  });

  it('repairs double-encoded characters from the source', () => {
    expect(repairMojibake('Store at 1Ã¢Â\u0080Â\u009340Â°C')).toBe('Store at 1–40°C');
    expect(repairMojibake('5 Î¼L blood required')).toBe('5 μL blood required');
    expect(repairMojibake('2°C to 30°C, Bühlmann')).toBe('2°C to 30°C, Bühlmann');
  });
});
