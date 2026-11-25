import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadSources } from './config.ts';

describe('loadSources', () => {
  it('applies local overrides: base URL, frozen (incl. false) and minIntervalMs', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dm-cfg-'));
    const committed = join(dir, 'sources.yaml');
    const local = join(dir, 'sources.local.yaml');
    writeFileSync(
      committed,
      'sources:\n  - { id: a, enabled: true, priority: 1, frozen: true }\n  - { id: b, enabled: true, priority: 2 }\n  - { id: c, enabled: true, priority: 3 }\n',
    );
    writeFileSync(
      local,
      'sources:\n  a: { baseUrl: "https://a.test", frozen: false, minIntervalMs: 10000 }\n  b: { baseUrl: "https://b.test" }\n',
    );
    const [a, b, c] = loadSources(committed, local);
    expect(a).toMatchObject({
      id: 'a',
      baseUrl: 'https://a.test',
      frozen: false,
      minIntervalMs: 10000,
      enabled: true,
    });
    expect(b).toMatchObject({ id: 'b', frozen: false, enabled: true });
    expect(b!.minIntervalMs).toBeUndefined();
    expect(c).toMatchObject({ id: 'c', enabled: false }); // no base URL anywhere
  });
});
