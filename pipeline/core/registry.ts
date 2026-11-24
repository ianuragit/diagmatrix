/**
 * Adapter registry. Sources are registered ONLY in pipeline/config/sources.yaml;
 * the adapter module is resolved by convention at pipeline/sources/{id}/adapter.ts
 * and must default-export a SourceAdapter (or a factory taking its SourceConfig).
 * Nothing in core, normalise, or the site needs editing to add a source.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, loadSources } from './config.ts';
import type { SourceAdapter, SourceConfig } from './types.ts';

export interface LoadedSource {
  config: SourceConfig;
  adapter: SourceAdapter;
}

type AdapterModule = { default: SourceAdapter | ((cfg: SourceConfig) => SourceAdapter) };

export async function loadAdapter(
  cfg: SourceConfig,
  sourcesDir = join(ROOT, 'pipeline', 'sources'),
): Promise<SourceAdapter> {
  const file = join(sourcesDir, cfg.id, 'adapter.ts');
  if (!existsSync(file)) throw new Error(`Source "${cfg.id}" has no adapter at ${file}`);
  const mod = (await import(pathToFileURL(file).href)) as AdapterModule;
  const adapter = typeof mod.default === 'function' ? mod.default(cfg) : mod.default;
  if (adapter.id !== cfg.id)
    throw new Error(`Adapter id "${adapter.id}" does not match sources.yaml id "${cfg.id}"`);
  return adapter;
}

export async function loadEnabledSources(
  opts: { only?: string[]; sourcesYaml?: string; sourcesDir?: string } = {},
): Promise<LoadedSource[]> {
  const configs = loadSources(opts.sourcesYaml).filter(
    (s) => s.enabled && (!opts.only?.length || opts.only.includes(s.id)),
  );
  return Promise.all(
    configs.map(async (config) => ({
      config,
      adapter: await loadAdapter(config, opts.sourcesDir),
    })),
  );
}
