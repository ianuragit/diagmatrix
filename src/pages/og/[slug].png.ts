/** Per-product Open Graph image. */
import type { APIRoute, GetStaticPaths } from 'astro';
import {
  analyteLabel,
  categoryLabel,
  liveProducts,
  techLabel,
  type Product,
} from '../../lib/catalogue';
import { renderOg } from '../../lib/og';
import { site } from '../../lib/site';

export const getStaticPaths = (async () =>
  (await liveProducts()).map((p) => ({
    params: { slug: p.slug },
    props: { p },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const p = (props as { p: Product }).p;
  const png = renderOg({
    siteName: site.name,
    kicker: p.brand,
    title: p.name,
    facts: [
      categoryLabel(p.category),
      p.technology ? techLabel(p.technology) : '',
      p.analyte.slice(0, 3).map(analyteLabel).join(', '),
      p.catalogue_no ? `Cat. ${p.catalogue_no}` : '',
    ],
  });
  return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
};
