/**
 * Extensibility proof: a brand-new source made by copying _template and adding
 * one sources.yaml entry is discovered and usable with no other code edits.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ROOT } from './config.ts';
import { loadEnabledSources } from './registry.ts';
import { RawProductSchema } from './types.ts';

const ID = 'zz_dummy_source_test';
const dir = join(ROOT, 'pipeline', 'sources', ID);
const tmp = mkdtempSync(join(tmpdir(), 'dm-reg-'));

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
  rmSync(tmp, { recursive: true, force: true });
});

describe('source registry', () => {
  it('loads a third source copied from _template via sources.yaml alone', async () => {
    cpSync(join(ROOT, 'pipeline', 'sources', '_template'), dir, { recursive: true });
    const yaml = join(tmp, 'sources.yaml');
    writeFileSync(
      yaml,
      `sources:\n  - { id: ${ID}, baseUrl: "https://dummy.test", enabled: true, priority: 99 }\n` +
        `  - { id: disabled_one, baseUrl: "https://x.test", enabled: false, priority: 1 }\n`,
    );
    const [src, ...rest] = await loadEnabledSources({ sourcesYaml: yaml });
    expect(rest).toHaveLength(0);
    expect(src!.adapter.id).toBe(ID);
    const parsed = src!.adapter.parseProduct(
      '<h1>Widget Rapid Test</h1><table><tr><th>Format</th><td>Cassette</td></tr></table>',
      { category: 'Test', name: 'Widget', url: 'https://dummy.test/widget-1.html' },
    );
    const raw = RawProductSchema.parse({ ...parsed, fetched_at: new Date().toISOString() });
    expect(raw.name).toBe('Widget Rapid Test');
    expect(raw.specs).toEqual({ Format: 'Cassette' });
  });
});
