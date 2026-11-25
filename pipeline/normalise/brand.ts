/**
 * Brand split. Order: name prefix (canonical/alias, longest first) → product line
 * at the start of the remaining name → brand stated by the source. Name-derived
 * brands win; a disagreeing stated brand is returned as `conflict` for the report.
 */
export interface BrandEntry {
  name: string;
  aliases: string[];
  lines: string[];
  /** Ordinary-word brand names: only used when a source states them. */
  stated_only?: boolean;
}

export interface BrandConfig {
  brands: BrandEntry[];
  oem_or_distributor?: string[];
}

export interface BrandResult {
  brand: string | null;
  product_line: string | null;
  /** Name with the brand prefix removed (product line kept). */
  name: string;
  method: 'name' | 'line' | 'stated' | 'none';
  /** Stated brand that disagreed with the name-derived one. */
  conflict: string | null;
  /** Stated brand not found in brands.yaml (passed through, tidied). */
  unknownStated: string | null;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** "SD BIOSENSOR" → "SD Biosensor"; short all-caps tokens (EDAN, CTK) are kept. */
export function tidyBrandCase(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t !== t.toUpperCase()) return t;
  return t
    .split(' ')
    .map((w) => (w.length <= 4 || /\d/.test(w) ? w : w[0] + w.slice(1).toLowerCase()))
    .join(' ');
}

export class BrandMatcher {
  private readonly prefixes: { text: string; brand: string; re: RegExp }[] = [];
  private readonly lines: { text: string; brand: string; re: RegExp }[] = [];
  private readonly byNorm = new Map<string, string>();
  private readonly lineOwner = new Map<string, string>();
  private readonly oem: Set<string>;

  constructor(cfg: BrandConfig) {
    for (const b of cfg.brands) {
      for (const text of [b.name, ...b.aliases]) {
        this.byNorm.set(norm(text), b.name);
        if (b.stated_only) continue;
        this.prefixes.push({
          text,
          brand: b.name,
          re: new RegExp(`^${esc(text)}(?=$|[\\s\\-:,/(])`, 'i'),
        });
        this.byNorm.set(norm(text), b.name);
      }
      for (const text of b.lines) {
        this.lineOwner.set(norm(text), b.name);
        this.lines.push({
          text,
          brand: b.name,
          re: new RegExp(`^${esc(text)}(?=$|[\\s\\-:,/(®™])`, 'i'),
        });
      }
    }
    this.prefixes.sort((a, b) => b.text.length - a.text.length);
    this.lines.sort((a, b) => b.text.length - a.text.length);
    this.oem = new Set((cfg.oem_or_distributor ?? []).map(norm));
  }

  canonical(stated: string | null | undefined): string | null {
    if (!stated) return null;
    return this.byNorm.get(norm(stated)) ?? null;
  }

  match(rawName: string, stated?: string | null): BrandResult {
    let name = rawName.replace(/\s+/g, ' ').trim();
    let brand: string | null = null;
    let method: BrandResult['method'] = 'none';

    // Strip repeated brand prefixes ("SD Biosensor SD BIOSENSOR STANDARD Q …").
    for (let guard = 0; guard < 3; guard++) {
      const p = this.prefixes.find((x) => x.re.test(name));
      if (!p || (brand && p.brand !== brand)) break;
      brand = p.brand;
      method = 'name';
      name = name
        .replace(p.re, '')
        .replace(/^[\s\-:,]+/, '')
        .trim();
    }

    let product_line: string | null = null;
    const l = this.lines.find((x) => x.re.test(name));
    if (l && (!brand || l.brand === brand)) {
      product_line = l.text;
      if (!brand) {
        brand = l.brand;
        method = 'line';
      }
    }

    const statedCanon = this.canonical(stated);
    let conflict: string | null = null;
    let unknownStated: string | null = null;
    if (!brand && stated) {
      brand = statedCanon ?? tidyBrandCase(stated);
      method = 'stated';
      if (!statedCanon) unknownStated = stated;
      // Strip the stated brand from the name too ("Acme QuickCheck" with brand "Acme").
      const re = new RegExp(`^(${esc(stated)}|${esc(brand)})(?=$|[\\s\\-:,/(])`, 'i');
      if (re.test(name))
        name = name
          .replace(re, '')
          .replace(/^[\s\-:,]+/, '')
          .trim();
    } else if (brand && stated) {
      const s = statedCanon ?? tidyBrandCase(stated);
      // A stated "brand" that is really one of this brand's product lines is not a conflict.
      if (s !== brand && this.lineOwner.get(norm(stated)) !== brand) conflict = s;
    }
    // An OEM/distributor stated brand never overrides; nothing to do beyond reporting.
    if (conflict && this.oem.has(norm(conflict))) conflict = `${conflict} (OEM/distributor)`;

    // Don't leave an empty name (e.g. a product named only by its brand).
    if (!name) name = rawName.trim();
    return { brand, product_line, name, method, conflict, unknownStated };
  }
}
