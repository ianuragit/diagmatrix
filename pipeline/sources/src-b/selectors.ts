/**
 * Selectors for src-b, written after inspecting the cached robots.txt, sitemap
 * and five product pages (a coagulation analyser, a rapid test, a PCR system, a
 * urine strip reader and a urine culture test). Snippets are scrubbed excerpts.
 *
 * The site is server-rendered by Nuxt and embeds the full structured product
 * record in a devalue-flattened JSON payload, so we read data, not prose.
 */
export const SELECTORS = {
  /**
   * robots.txt → "Sitemap: https://src-b.example/sitemap_index.xml"
   *   <sitemapindex><sitemap><loc>https://src-b.example/__sitemap__/de.xml</loc></sitemap></sitemapindex>
   * Child sitemap entries:
   *   <url><loc>https://src-b.example/products/xprecia-stride-coagulation-analyzer</loc>…
   */
  sitemapIndexPath: '/sitemap_index.xml',
  sitemapLoc: 'sitemap > loc',
  urlLoc: 'url > loc',
  /** Product pages: /products/{slug} (the bare /products listing is excluded). */
  productPath: /^\/products\/[^/]+\/?$/,

  /**
   * <script type="application/json" data-nuxt-data="nuxt-app" id="__NUXT_DATA__">[…]</script>
   * Decoded root: { data: { "product-{slug}": { id, name, manufacturer: { name },
   *   categories: [{ name, slug, parent, children }], attachment_types: [{ key, name,
   *   suffix, attachments: [{ string_value, numeric_value }] }], media: [{ url }],
   *   knowledge_links: [{ link_category: { key, name }, entries: [{ name, url }] }],
   *   children: [ …same shape, no manufacturer… ], related_products: [{ id, slug }] } } }
   */
  nuxtData: '#__NUXT_DATA__',
  productKeyPrefix: 'product-',
} as const;

/** Attribute keys copied into `facts` (the structured core) besides going into specs. */
export const FACT_KEYS = [
  'parameter',
  'method',
  'sample-type',
  'sample-size',
  'result-time',
] as const;

/** knowledge_links categories → our document type. Anything not listed is ignored. */
export const DOC_TYPES: Record<string, string> = {
  product_manuals: 'manual',
  product_brochures: 'brochure',
  other_documents: 'datasheet',
  ifu: 'ifu',
  application_studies: 'study',
  comparison_studies: 'study',
  laboratory_evaluation: 'study',
  health_economic_studies: 'study',
  videos: 'video',
};
