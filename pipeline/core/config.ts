/** Loaders for project.config.yaml and pipeline/config/*.yaml. */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import { SourceConfigSchema, type SourceConfig } from './types.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const CONFIG_DIR = join(ROOT, 'pipeline', 'config');
/** Git-ignored. Holds real source URLs and the private-term list. */
export const LOCAL_SOURCES = join(CONFIG_DIR, 'sources.local.yaml');

export const ProjectConfigSchema = z.object({
  site_name: z.string(),
  github_repo: z.string(),
  site_url: z.string(),
  form: z.object({ service: z.string(), key: z.string() }),
  whatsapp_number: z.string(),
  contact_email: z.string(),
  cname: z.string().nullable(),
  allow_ai_crawlers: z.boolean(),
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

export const isPlaceholder = (v: unknown): boolean => typeof v === 'string' && /\{\{.*\}\}/.test(v);
export const isUnset = (v: unknown): boolean =>
  v === null || v === undefined || v === '' || isPlaceholder(v);

export function loadYaml<T = unknown>(path: string): T {
  return parse(readFileSync(path, 'utf8')) as T;
}

export function loadProjectConfig(root = ROOT): ProjectConfig {
  return ProjectConfigSchema.parse(loadYaml(join(root, 'project.config.yaml')));
}

/** Throws a clear error listing any required keys that are still unset. */
export function requireConfig(
  cfg: ProjectConfig,
  keys: (keyof ProjectConfig | 'form.service' | 'form.key')[],
): void {
  const missing = keys.filter((k) =>
    isUnset(
      k.startsWith('form.')
        ? cfg.form[k.slice(5) as 'service' | 'key']
        : cfg[k as keyof ProjectConfig],
    ),
  );
  if (missing.length)
    throw new Error(`project.config.yaml has unset values for: ${missing.join(', ')}`);
}

// ---------------------------------------------------------------------------
// Sources: committed registry (neutral ids) + git-ignored local overlay (URLs)
// ---------------------------------------------------------------------------

const CommittedSourceSchema = SourceConfigSchema.extend({ baseUrl: z.url().nullable().optional() });

const LocalSourcesSchema = z.object({
  sources: z
    .record(
      z.string(),
      z.object({
        baseUrl: z.url().optional(),
        enabled: z.boolean().optional(),
        minIntervalMs: z.number().int().min(1000).optional(),
      }),
    )
    .default({}),
  /** Terms that must never appear in tracked files or the built site. */
  private_terms: z.array(z.string()).default([]),
});
export type LocalSources = z.infer<typeof LocalSourcesSchema>;

export function loadLocalSources(path = LOCAL_SOURCES): LocalSources {
  if (!existsSync(path)) return { sources: {}, private_terms: [] };
  return LocalSourcesSchema.parse(loadYaml(path) ?? {});
}

/**
 * Committed sources.yaml merged with sources.local.yaml. Base URL precedence:
 * env SOURCE_<ID>_URL (for CI, from a repo secret) > local file > committed value.
 * A source without a resolvable base URL is returned disabled.
 */
export function loadSources(
  path = join(CONFIG_DIR, 'sources.yaml'),
  localPath = LOCAL_SOURCES,
): SourceConfig[] {
  if (!existsSync(path)) return [];
  const doc = loadYaml<{ sources?: unknown[] }>(path);
  const list = z.array(CommittedSourceSchema).parse(doc?.sources ?? []);
  const local = loadLocalSources(localPath);
  const ids = new Set<string>();
  const out: SourceConfig[] = [];
  for (const s of list) {
    if (ids.has(s.id)) throw new Error(`Duplicate source id in sources.yaml: ${s.id}`);
    ids.add(s.id);
    const envKey = `SOURCE_${s.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_URL`;
    const baseUrl = process.env[envKey] || local.sources[s.id]?.baseUrl || s.baseUrl || null;
    const enabled = (local.sources[s.id]?.enabled ?? s.enabled) && !!baseUrl;
    out.push(
      SourceConfigSchema.parse({ ...s, baseUrl: baseUrl ?? 'https://unset.invalid', enabled }),
    );
  }
  return out.sort((a, b) => a.priority - b.priority);
}

/** Every term that must stay out of the repo and site: private_terms + source hostnames. */
export function privateTerms(localPath = LOCAL_SOURCES): string[] {
  const local = loadLocalSources(localPath);
  const terms = new Set(
    local.private_terms.map((t) => t.toLowerCase()).filter((t) => t.length >= 3),
  );
  for (const s of Object.values(local.sources)) {
    if (!s.baseUrl) continue;
    const host = new URL(s.baseUrl).hostname.toLowerCase();
    terms.add(host);
    terms.add(host.replace(/^www\./, ''));
  }
  return [...terms];
}
