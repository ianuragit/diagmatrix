import { describe, expect, it } from 'vitest';
import { dedupeKey, findGroups } from './dedupe.ts';

describe('dedupeKey', () => {
  it('collapses known duplicate spellings to one key', () => {
    const k = (n: string, b = 'Abbott') => dedupeKey(n, b);
    expect(k('Bioline HIV 1/2 3.0')).toBe(k('Bioline HIV 1 2 3.0'));
    expect(k('Bioline STREP A')).toBe(k('Bioline Strep A'));
    expect(k('BinaxNOW G6PD')).toBe(k('BinaxNOW  G6PD'));
    expect(dedupeKey('STANDARD Q COVID 19 Ag', 'SD Biosensor')).toBe(
      dedupeKey('STANDARD Q COVID-19 Ag', 'SD Biosensor'),
    );
    expect(dedupeKey('STANDARD Q HBsAg (30T)', null)).toBe(dedupeKey('STANDARD Q HBsAg', null));
  });
  it('keeps genuinely different products apart', () => {
    expect(dedupeKey('Bioline HIV 1/2 3.0', 'Abbott')).not.toBe(
      dedupeKey('Bioline HIV/SYPHILIS DUO', 'Abbott'),
    );
    expect(dedupeKey('i15 controls level 2', 'EDAN')).not.toBe(
      dedupeKey('i15 controls level 3', 'EDAN'),
    );
    expect(dedupeKey('Bioline Dengue IgG/IgM', 'Abbott')).not.toBe(
      dedupeKey('Bioline Dengue NS1 Ag', 'Abbott'),
    );
  });
  it('does not mistake a model number before "Test" for a pack size', () => {
    expect(dedupeKey('Combur 7 Test Strip', 'Roche')).not.toBe(
      dedupeKey('Combur 10 Test Strip', 'Roche'),
    );
    expect(dedupeKey('Glucose 50 strips', null)).toBe(dedupeKey('Glucose', null));
  });
  it('keeps a trailing "+" model marker but treats "Ag+Ab" like "Ag Ab"', () => {
    expect(dedupeKey('CLINITEK Status+ Analyzer', 'Siemens')).not.toBe(
      dedupeKey('CLINITEK Status Analyzer', 'Siemens'),
    );
    expect(dedupeKey('STANDARD Q Dengue Ag+Ab Duo', null)).toBe(
      dedupeKey('STANDARD Q Dengue Ag Ab Duo', null),
    );
  });
  it('is order-insensitive', () => {
    expect(dedupeKey('Dengue IgM IgG', null)).toBe(dedupeKey('Dengue IgG/IgM', null));
  });
});

describe('findGroups', () => {
  it('picks the record with most fields as canonical, tie → lowest id', () => {
    const g = findGroups([
      { id: 'b', key: 'x', brand: 'A', source: 's', filled: 3 },
      { id: 'a', key: 'x', brand: 'A', source: 's', filled: 3 },
      { id: 'c', key: 'x', brand: 'A', source: 's', filled: 9 },
      { id: 'd', key: 'x', brand: 'B', source: 's', filled: 1 },
      { id: 'e', key: 'y', brand: 'A', source: 's', filled: 1 },
    ]);
    expect(g).toEqual([{ key: 'x', brand: 'A', canonical: 'c', members: ['c', 'a', 'b'] }]);
  });
});
