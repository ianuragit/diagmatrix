import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanForTerms } from './privacy.ts';
import { privateTerms } from './config.ts';

describe('privacy guard', () => {
  it('finds private terms case-insensitively with line numbers', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dm-priv-'));
    const f = join(dir, 'a.md');
    writeFileSync(f, 'fine\nmentions ACME Corp here\n');
    expect(scanForTerms([f], ['acme corp'], dir)).toEqual([
      { file: 'a.md', line: 2, term: 'acme corp' },
    ]);
    expect(scanForTerms([f], [], dir)).toEqual([]);
  });

  it('derives terms from the local file, including hostnames', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dm-priv-'));
    const local = join(dir, 'sources.local.yaml');
    writeFileSync(
      local,
      'sources:\n  x: { baseUrl: "https://www.shop.test" }\nprivate_terms: [Acme, ab]\n',
    );
    expect(privateTerms(local).sort()).toEqual(['acme', 'shop.test', 'www.shop.test']);
  });
});
