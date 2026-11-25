/**
 * Content collection over the committed catalogue. The schema is the pipeline's
 * single source of truth (pipeline/core/types.ts), so the site can never render
 * a record that `pnpm validate` would reject.
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { ProductSchema } from '../pipeline/core/types.ts';

const products = defineCollection({
  loader: file('data/products.json'),
  schema: ProductSchema,
});

export const collections = { products };
