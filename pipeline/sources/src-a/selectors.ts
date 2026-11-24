/**
 * Selectors for src-a, written after inspecting cached pages (homepage + a rapid
 * test, an ELISA kit, an analyser, a consumable and a control). Snippets below
 * are scrubbed excerpts of the real markup.
 */
export const SELECTORS = {
  /**
   * Homepage nav. The "Our Business" item holds every category; each category
   * <li> holds a <ul> of every product in it (verified: category pages list no
   * extra products and have no pagination).
   *
   *   <div id="cssmenu"><ul>
   *     <li><a href="/home.html">Home</a></li>
   *     <li class="active"><a href="/products.html" class="hilight">Our Business</a><ul>
   *       <li><a href="/healthcare.html">Medical IVD</a><ul id="myDiv">
   *         <li><a href="/abbott-bioline-hbsag-1000001.html">Abbott Bioline HBsAg</a></li>
   */
  navTopItems: '#cssmenu > ul > li',
  navBusinessLabel: 'Our Business',
  navCategoryItems: ':scope > ul > li', // relative to the "Our Business" <li>
  navCategoryLink: ':scope > a',
  navProductLinks: ':scope > ul > li > a', // relative to a category <li>

  /** Product URL: /{slug}-{numericId}.html — the trailing number is the record id. */
  productUrlId: /-(\d+)\.html$/,

  /** <div class="product-heading"><h1>Abbott Bioline HBsAg</h1></div> */
  name: '.product-heading h1',

  /**
   * <div class="breadcrumb"><ul itemtype="http://schema.org/BreadcrumbList">
   *   <li>…Home</li><li>…Products</li><li>…<span itemprop="name">Medical IVD</span></li>
   *   <li><span itemprop="name">Abbott Bioline HBsAg</span></li>
   */
  breadcrumbItems: '.breadcrumb li [itemprop="name"]',

  /**
   * Summary list near the title (a subset of the full specs):
   *   <div class="product-details"><h3>Product Details:</h3><ul>
   *     <li><span>Accuracy</span><span>&gt;99%</span></li>
   */
  detailRows: '.product-details li',

  /**
   * Spec blocks, one <div> per <h2>. Only "… Product Specifications" blocks are
   * facts; "… Price And Quantity" / "… Trade Information" are commercial terms.
   *   <div id="productSpecsSection">
   *     <div><h2>Abbott Bioline HBsAg Product Specifications</h2>
   *       <ul><li><label>Technology</label><span>Lateral Flow Immunoassay</span></li>
   */
  specBlocks: '#productSpecsSection > div',
  specBlockHeading: ':scope > h2',
  specBlockKeep: /Product Specifications\s*$/i,
  specRows: 'li',
  specKey: 'label',
  specValue: 'span',

  /**
   * Description with an optional two-column fact table. This table is the most
   * reliable source of brand / sample / pack size / catalogue number.
   *   <div id="productDescription"><div><h2>Product Description</h2>
   *     <table><tbody><tr><td>Brand</td><td>Abbott</td></tr>
   *       <tr><td>Pack Size</td><td>30T</td></tr><tr><td>CAT No</td><td>01FK10</td></tr>
   *     </tbody></table><br><p>Bioline Hepatitis tests are intended…</p>
   *     <div align="justify"><h2>FAQ's of …</h2>…</div>
   */
  description: '#productDescription',
  factRows: '#productDescription table tr',
  faqBlock: 'div[align="justify"]', // removed only when its <h2> says FAQ

  /** <div class="product-info-section">…<img src="https://<img-cdn>/1000001/b/6/Abbott-Bioline-HBsAg.jpg"> */
  mainImage: '.product-info-section img',

  /** No sampled page had documents; kept generic in case some do. */
  documentLinks: 'a[href$=".pdf" i], a[href*=".pdf?" i]',
} as const;

/** Fact-table keys that carry the catalogue number (manufacturer REF). */
export const CATALOGUE_KEYS =
  /^(cat(alog(ue)?)?\.?\s*(no|number|#)?\.?|ref(erence)?\s*(no)?\.?|product code|part (no|number)|model no\.?)$/i;
export const BRAND_KEYS = /^(brand|make|manufacturer)$/i;
