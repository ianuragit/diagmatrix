/** Per-product JSON twin of /products/{slug}/ (linked via rel="alternate"). */
import type { APIRoute, GetStaticPaths } from 'astro';
import { liveProducts, type Product } from '../../lib/catalogue';
import { abs } from '../../lib/seo';

export const getStaticPaths = (async () =>
  (await liveProducts()).map((p) => ({
    params: { slug: p.slug },
    props: { p },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { duplicate_of: _d, ...p } = (props as { p: Product }).p;
  return new Response(
    JSON.stringify(
      {
        ...p,
        url: abs(`/products/${p.slug}/`, site),
        related: p.related.map((r) => abs(`/products/${r}/`, site)),
      },
      null,
      2,
    ),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
