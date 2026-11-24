/**
 * The ONE helper for internal links. Prefixes the configured base path so links
 * work under /repo/ on GitHub Pages and at / on a custom domain.
 *   url('/products/')            -> '/diagmatrix/products/'
 *   url('products/abc/')         -> '/diagmatrix/products/abc/'
 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}
