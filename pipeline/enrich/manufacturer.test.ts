import { describe, expect, it } from 'vitest';
import {
  extractItem,
  matchManufacturer,
  productLinks,
  type ManufacturerItem,
} from './manufacturer.ts';

const cfg = {
  brand: 'NAL von minden',
  product_url: '^https://x\\.test/deu/[a-z0-9-]+\\.html$',
  exclude: '/category\\.html$',
  name: 'itemprop="name">([^<]+)</span>',
  catalogue: ['"variantSkus":\\s*"([^"]+)"', '>SKU</th>\\s*<td[^>]*>\\s*([A-Z0-9-]+)'],
  name_prefix: '^nadal\\b',
  platforms: ['\\bcolibri', '\\b(pcr|lamp)\\b'],
  exclude_names: '^(afias)\\b',
};
const item = (name: string, catalogue_no: string): ManufacturerItem => ({
  name,
  catalogue_no,
  url: `https://x.test/${catalogue_no}`,
});
const p = (name: string) => ({ name, product_line: null, subtype: null });

describe('extractItem', () => {
  it('reads the name and the variant numbers, falling back to the SKU row', () => {
    expect(
      extractItem(
        '<span itemprop="name">NADAL&reg; CRP Test</span> "variantSkus": "311801N-20"',
        'u',
        cfg,
      ),
    ).toEqual({ name: 'NADAL CRP Test', catalogue_no: '311801N-20', url: 'u' });
    expect(
      extractItem('<span itemprop="name">Reactif 7</span><th>SKU</th><td>41070-L</td>', 'u', cfg)
        ?.catalogue_no,
    ).toBe('41070-L');
    expect(extractItem('<span itemprop="name">No number</span>', 'u', cfg)).toBeNull();
  });
  it('rejects numbers outside an only_prefix', () => {
    expect(
      extractItem('<h1>X</h1>"variantSkus": "AF-1"', 'u', {
        ...cfg,
        name: undefined,
        only_prefix: '^HI-',
      }),
    ).toBeNull();
  });
});

describe('productLinks', () => {
  it('keeps product URLs and drops excluded category pages', () => {
    const html =
      '<a href="/deu/nadal-crp.html"></a><a href="/deu/category.html"></a><a href="/x.pdf"></a>';
    expect(productLinks(html, 'https://x.test/deu/start.html', cfg)).toEqual([
      'https://x.test/deu/nadal-crp.html',
    ]);
  });
});

describe('matchManufacturer', () => {
  const items = [
    item('NADAL CRP Test', '311801N-20'),
    item('NADAL CRP plus Test', '311804N-20'),
    item('NADAL Strep A Rapid Test', '221901N-40'),
    item('NADAL Strep B Test', '232001'),
    item('NADAL FOB Test', '272039N-20'),
    item('NADAL FOB Quant Test for Colibri', '272059NBUL-20'),
    item('NADAL SARS-CoV-2 PCR Test', '2710501'),
    item('AFIAS Vitamin D Test', '3170243'),
  ];
  it('prefers the exact word set and keeps "plus" and single letters distinct', () => {
    expect(matchManufacturer(p('CRP'), items, cfg).catalogue_no).toBe('311801N-20');
    expect(matchManufacturer(p('Strep A'), items, cfg).catalogue_no).toBe('221901N-40');
  });
  it('matches instrument-bound reagents only to that instrument family', () => {
    expect(matchManufacturer(p('FOB'), items, cfg, 'Colibri+').catalogue_no).toBe('272059NBUL-20');
    expect(matchManufacturer(p('FOB'), items, cfg).catalogue_no).toBe('272039N-20');
    expect(matchManufacturer(p('SARS-CoV-2'), items, cfg, 'Nadal PCR Pro1 lamp').catalogue_no).toBe(
      '2710501',
    );
    expect(matchManufacturer(p('SARS-CoV-2'), items, cfg).status).toBe('none');
  });
  it('ignores products of other brands the site resells', () => {
    expect(matchManufacturer(p('Vitamin D'), items, cfg).status).toBe('none');
  });
});
