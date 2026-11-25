/** SEO / GEO helpers: absolute URLs and JSON-LD builders. */
import type { Product } from './catalogue';
import {
  analyteLabel,
  categoryLabel,
  displayName,
  sampleLabel,
  techLabel,
  typeLabel,
} from './catalogue';
import { site } from './site';
import { url } from './url';

export const abs = (path: string, siteUrl: URL | undefined) => new URL(url(path), siteUrl).href;

export function productJsonLd(p: Product, siteUrl: URL | undefined) {
  const props = [
    p.technology && { name: 'Technology', value: techLabel(p.technology) },
    p.analyte.length && { name: 'Analyte', value: p.analyte.map(analyteLabel).join(', ') },
    p.sample_type.length && {
      name: 'Sample type',
      value: p.sample_type.map(sampleLabel).join(', '),
    },
    p.product_type && { name: 'Product type', value: typeLabel(p.product_type) },
    p.pack_size && { name: 'Pack size', value: `${p.pack_size.value} ${p.pack_size.unit}` },
    ...Object.entries(p.specs).map(([name, value]) => ({ name, value })),
  ]
    .filter((x): x is { name: string; value: string } => !!x)
    .map((x) => ({ '@type': 'PropertyValue', ...x }));
  const pageUrl = abs(`/products/${p.slug}/`, siteUrl);
  // No price/offer fields: the directory publishes no prices.
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: displayName(p),
    url: pageUrl,
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(p.catalogue_no ? { sku: p.catalogue_no, mpn: p.catalogue_no } : {}),
    category: [categoryLabel(p.category), p.technology ? techLabel(p.technology) : null]
      .filter(Boolean)
      .join(' > '),
    ...(p.summary ? { description: p.summary } : {}),
    image: abs(`/og/${p.slug}.png`, siteUrl),
    additionalProperty: props,
    ...(p.related.length
      ? {
          isRelatedTo: p.related.map((r) => ({
            '@type': 'Product',
            url: abs(`/products/${r}/`, siteUrl),
          })),
        }
      : {}),
    subjectOf: { '@type': 'WebPage', url: pageUrl, dateModified: p.updated_at },
  };
}

export function itemListJsonLd(
  name: string,
  items: Product[],
  siteUrl: URL | undefined,
  offset = 0,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: offset + i + 1,
      url: abs(`/products/${p.slug}/`, siteUrl),
      name: displayName(p),
    })),
  };
}

export function homeJsonLd(siteUrl: URL | undefined) {
  const home = abs('/', siteUrl);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${home}#org`,
      name: site.name,
      url: home,
      logo: abs('/favicon.svg', siteUrl),
      ...(site.email ? { email: site.email } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${home}#website`,
      name: site.name,
      url: home,
      publisher: { '@id': `${home}#org` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${abs('/search/', siteUrl)}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

/** Safe JSON for <script type="application/ld+json">. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
