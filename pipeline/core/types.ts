/**
 * Single source of truth for data shapes. Reused by the pipeline (validation)
 * and by the Astro site (content collections / page props).
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Discovery + raw records (per-source, pre-normalisation)
// ---------------------------------------------------------------------------

export const NavEntrySchema = z.object({
  category: z.string(),
  subcategory: z.string().nullable().optional(),
  name: z.string(),
  url: z.url(),
});
export type NavEntry = z.infer<typeof NavEntrySchema>;

export const DocumentSchema = z.object({
  title: z.string(),
  url: z.url(),
  type: z.string(), // pdf | ifu | datasheet | msds | other
});
export type ProductDocument = z.infer<typeof DocumentSchema>;

/** What an adapter's parseProduct returns: facts only, no interpretation. */
export const RawProductSchema = z.object({
  source: z.string(),
  source_id: z.string(),
  url: z.url(),
  fetched_at: z.string(), // ISO 8601
  name: z.string().min(1),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  brand: z.string().nullable(), // only if the page states it explicitly
  catalogue_no: z.string().nullable(),
  specs: z.record(z.string(), z.string()),
  image: z.url().nullable(),
  documents: z.array(DocumentSchema),
  /** Raw description text, kept for fact extraction only — never published verbatim. */
  description_raw: z.string().nullable(),
});
export type RawProduct = z.infer<typeof RawProductSchema>;
/** parseProduct output; the CLI stamps fetched_at from the HTTP cache metadata. */
export type ParsedProduct = Omit<RawProduct, 'fetched_at'>;

// ---------------------------------------------------------------------------
// Final catalogue record
// ---------------------------------------------------------------------------

export const PRODUCT_TYPES = ['instrument', 'reagent', 'consumable'] as const;

export const PackSizeSchema = z.object({
  value: z.number().positive(),
  unit: z.string(), // tests | strips | mL | cartridges | ...
  raw: z.string(),
});
export type PackSize = z.infer<typeof PackSizeSchema>;

export const SourceRefSchema = z.object({
  source: z.string(),
  source_id: z.string(),
  url: z.url(),
  fetched_at: z.string(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const ProductSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  brand: z.string().nullable(),
  product_line: z.string().nullable(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  technology: z.string().nullable(),
  analyte: z.array(z.string()),
  sample_type: z.array(z.string()),
  product_type: z.enum(PRODUCT_TYPES).nullable(),
  subtype: z.string().nullable(), // control | calibrator | cartridge | ...
  pack_size: PackSizeSchema.nullable(),
  catalogue_no: z.string().nullable(),
  specs: z.record(z.string(), z.string()),
  summary: z.string().nullable(),
  image: z.url().nullable(),
  image_local: z.string().nullable(),
  documents: z.array(DocumentSchema),
  related: z.array(z.string()).max(8),
  sources: z.array(SourceRefSchema).min(1),
  duplicate_of: z.string().nullable(),
  classification_confidence: z.number().min(0).max(1),
  updated_at: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CatalogueSchema = z.array(ProductSchema);

// ---------------------------------------------------------------------------
// Adapter contract — the extensibility point
// ---------------------------------------------------------------------------

export interface AdapterContext {
  /** Polite, cached HTTP getter (robots + throttle + disk cache). Throws RobotsDisallowedError. */
  get(url: string): Promise<{ url: string; status: number; body: string; fromCache: boolean }>;
  log: import('./log.ts').Logger;
}

export interface SourceAdapter {
  id: string;
  baseUrl: string;
  /** The context argument carries the polite HTTP client; adapters never fetch directly. */
  discover(ctx: AdapterContext): Promise<NavEntry[]>;
  /** Pure function of the HTML — this is what the fixture tests exercise. */
  parseProduct(html: string, entry: NavEntry): ParsedProduct;
}

/** One entry of pipeline/config/sources.yaml */
export const SourceConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/),
  baseUrl: z.url(),
  enabled: z.boolean(),
  priority: z.number().int(), // lower = wins field-level precedence
});
export type SourceConfig = z.infer<typeof SourceConfigSchema>;
