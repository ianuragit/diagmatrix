/** Loaders for project.config.yaml and pipeline/config/*.yaml. */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import { SourceConfigSchema, type SourceConfig } from './types.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const CONFIG_DIR = join(ROOT, 'pipeline', 'config');

export const ProjectConfigSchema = z.object({
  site_name: z.string(),
  github_repo: z.string(),
  site_url: z.string(),
  diagnoodle_url: z.string(),
  form: z.object({ service: z.string(), key: z.string() }),
  whatsapp_number: z.string(),
  contact_email: z.string(),
  cname: z.string().nullable(),
  allow_ai_crawlers: z.boolean(),
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

export const isPlaceholder = (v: unknown): boolean => typeof v === 'string' && /\{\{.*\}\}/.test(v);

export function loadYaml<T = unknown>(path: string): T {
  return parse(readFileSync(path, 'utf8')) as T;
}

export function loadProjectConfig(root = ROOT): ProjectConfig {
  return ProjectConfigSchema.parse(loadYaml(join(root, 'project.config.yaml')));
}

/** Throws a clear error listing any required keys that are still {{placeholders}}. */
export function requireConfig(
  cfg: ProjectConfig,
  keys: (keyof ProjectConfig | 'form.service' | 'form.key')[],
): void {
  const missing = keys.filter((k) => {
    const v = k.startsWith('form.')
      ? cfg.form[k.slice(5) as 'service' | 'key']
      : cfg[k as keyof ProjectConfig];
    return v === null || v === '' || isPlaceholder(v);
  });
  if (missing.length) {
    throw new Error(`project.config.yaml still has placeholders for: ${missing.join(', ')}`);
  }
}

export function loadSources(path = join(CONFIG_DIR, 'sources.yaml')): SourceConfig[] {
  if (!existsSync(path)) return [];
  const doc = loadYaml<{ sources?: unknown[] }>(path);
  const list = z.array(SourceConfigSchema).parse(doc?.sources ?? []);
  const ids = new Set<string>();
  for (const s of list) {
    if (ids.has(s.id)) throw new Error(`Duplicate source id in sources.yaml: ${s.id}`);
    ids.add(s.id);
  }
  return list.sort((a, b) => a.priority - b.priority);
}
