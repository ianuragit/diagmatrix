import { describe, expect, it } from 'vitest';
import { parsePackSize, stripPackSize } from './packsize.ts';

describe('parsePackSize', () => {
  it.each([
    ['(48T)', 48, 'tests'],
    ['30T', 30, 'tests'],
    ['25 tests', 25, 'tests'],
    ['50 Strips', 50, 'strips'],
    ['96 Wells', 96, 'wells'],
    ['2.0 mL', 2, 'mL'],
    ['100 Det', 100, 'tests'],
    ['24 cartridges', 24, 'cartridges'],
  ])('%s → %d %s', (raw, value, unit) => {
    expect(parsePackSize(raw)).toMatchObject({ value, unit });
  });

  it('parses count × volume', () => {
    expect(parsePackSize('5 2.5ml')).toEqual({ value: 5, unit: '× 2.5 mL', raw: '5 2.5ml' });
    expect(parsePackSize('4 x 5 mL')).toMatchObject({ value: 4, unit: '× 5 mL' });
  });

  it('returns null for nothing recognisable, never guesses', () => {
    expect(parsePackSize('Individually packed')).toBeNull();
    expect(parsePackSize('')).toBeNull();
    expect(parsePackSize(null)).toBeNull();
    expect(parsePackSize('HIV 1/2 3.0')).toBeNull();
  });
});

describe('stripPackSize', () => {
  it('removes bracketed and trailing pack sizes from names', () => {
    expect(stripPackSize('STANDARD Q HBsAg (30T)')).toEqual({
      name: 'STANDARD Q HBsAg',
      pack: { value: 30, unit: 'tests', raw: '30T' },
    });
    expect(stripPackSize('Glucose Test 50 Strips').name).toBe('Glucose Test');
    expect(stripPackSize('i15 cartridge (120T)').pack?.value).toBe(120);
  });
  it('leaves names without pack sizes alone', () => {
    expect(stripPackSize('Bioline HIV 1/2 3.0')).toEqual({
      name: 'Bioline HIV 1/2 3.0',
      pack: null,
    });
    expect(stripPackSize('Dengue IgG/IgM WB').pack).toBeNull();
  });
});
