/**
 * CSS selectors for <source>. Write these only after inspecting saved HTML in
 * .cache/http/<host>/ — each selector gets a comment quoting the snippet it targets.
 */
export const SELECTORS = {
  /** e.g. <nav class="menu"><a href="/category.html">Category</a> */
  navLinks: 'nav a',
  /** e.g. <h1 class="product-title">Name</h1> */
  productName: 'h1',
  /** e.g. <table class="specs"><tr><th>Key</th><td>Value</td></tr></table> */
  specRows: 'table tr',
} as const;
