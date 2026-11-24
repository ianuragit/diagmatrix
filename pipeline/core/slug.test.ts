import { describe, expect, it } from 'vitest';
import { slugify, createIdAllocator } from './slug.ts';

describe('slug', () => {
  it('slugifies deterministically', () => {
    expect(slugify('STANDARD Q Dengue IgM/IgG (48T)')).toBe('standard-q-dengue-igm-igg-48t');
    expect(slugify('HIV 1+2 & Syphilis')).toBe('hiv-1-plus-2-and-syphilis');
    expect(slugify('  Ünïcode —  test ')).toBe('unicode-test');
  });

  it('keeps ids stable across runs via the id map, hashing collisions', () => {
    const map = new Map<string, string>();
    const alloc = createIdAllocator(map);
    const a = alloc('s:1', 'Abbott Determine HBsAg');
    const b = alloc('s:2', 'Abbott Determine HBsAg');
    expect(a).toBe('abbott-determine-hbsag');
    expect(b).toMatch(/^abbott-determine-hbsag-[0-9a-f]{6}$/);

    // Next run: records arrive in a different order — ids must not swap.
    const alloc2 = createIdAllocator(new Map(map));
    expect(alloc2('s:2', 'Abbott Determine HBsAg')).toBe(b);
    expect(alloc2('s:1', 'Abbott Determine HBsAg')).toBe(a);
    // A new record never steals an existing id.
    expect(alloc2('s:3', 'Abbott Determine HBsAg')).not.toBe(a);
  });
});
