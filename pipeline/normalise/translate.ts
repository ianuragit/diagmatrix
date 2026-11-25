/**
 * German → English for display text (names, spec values, document titles),
 * driven by pipeline/config/translations.yaml. Also detects leftovers so
 * `pnpm validate` can refuse to publish non-English text.
 */
export interface TranslationConfig {
  names?: Record<string, string>;
  values?: Record<string, string>;
  terms?: Record<string, string>;
  phrases?: Record<string, string>;
  allow?: string[];
  markers?: string[];
}

/**
 * Repairs UTF-8 text that was decoded as Latin-1 (once or twice) at the source,
 * e.g. "1Ã¢Â\x80Â\x9340Â°C" → "1–40°C", "5 Î¼L" → "5 μL".
 */
export function repairMojibake(s: string): string {
  // Only sequences that are valid UTF-8 when read as Latin-1 bytes are decoded; up to 3 layers.
  const seq =
    /[\u00c2-\u00df][\u0080-\u00bf]|[\u00e0-\u00ef][\u0080-\u00bf]{2}|[\u00f0-\u00f4][\u0080-\u00bf]{3}/g;
  let out = s;
  for (let i = 0; i < 3; i++) {
    const next = out.replace(seq, (m) => {
      const d = Buffer.from(m, 'latin1').toString('utf8');
      return d.includes('\ufffd') ? m : d;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const boundary = (s: string) => new RegExp(`(?<![\\p{L}\\p{N}])${esc(s)}(?![\\p{L}\\p{N}])`, 'giu');
const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

export class Translator {
  private readonly names: Map<string, string>;
  private readonly values: Map<string, string>;
  private readonly terms: Map<string, string>;
  private readonly phrases: { re: RegExp; to: string }[];
  private readonly markers: RegExp[];
  private readonly allow: Set<string>;

  constructor(cfg: TranslationConfig) {
    this.names = new Map(Object.entries(cfg.names ?? {}).map(([k, v]) => [norm(k), v]));
    this.values = new Map(Object.entries(cfg.values ?? {}).map(([k, v]) => [norm(k), v]));
    this.terms = new Map(Object.entries(cfg.terms ?? {}).map(([k, v]) => [norm(k), v]));
    this.phrases = Object.entries(cfg.phrases ?? {})
      .sort((a, b) => b[0].length - a[0].length)
      .map(([k, to]) => ({ re: boundary(k), to }));
    this.markers = (cfg.markers ?? []).map(boundary);
    this.allow = new Set((cfg.allow ?? []).map((a) => a.toLowerCase()));
  }

  /** Free text: whole-value override, else phrase replacements. */
  text(raw: string): string {
    const s = repairMojibake(raw);
    const whole = this.values.get(norm(s)) ?? this.terms.get(norm(s));
    if (whole) return whole;
    let out = s;
    for (const { re, to } of this.phrases) out = out.replace(re, to);
    return out.replace(/\s+/g, ' ').trim();
  }

  /** Product names: full-name override, else phrases; first letter capitalised. */
  name(raw: string): string {
    const s = repairMojibake(raw);
    const whole = this.names.get(norm(s));
    if (whole) return whole;
    const t = this.text(s);
    return t === s ? s : t.charAt(0).toUpperCase() + t.slice(1);
  }

  /** Comma-separated lists (analytes, methods): each item via terms, else text(). */
  list(raw: string): string {
    return repairMojibake(raw)
      .split(/,\s*/)
      .map((item) => this.terms.get(norm(item)) ?? this.text(item))
      .join(', ');
  }

  /** Untranslated German left in `s` (markers or non-English letters outside allowed proper nouns). */
  leftovers(s: string): string[] {
    const found = new Set<string>();
    for (const re of this.markers) for (const m of s.matchAll(re)) found.add(m[0]);
    for (const word of s.match(/[\p{L}-]*[äöüÄÖÜß][\p{L}-]*/gu) ?? []) {
      if (![...this.allow].some((a) => word.toLowerCase().includes(a.toLowerCase())))
        found.add(word);
    }
    return [...found];
  }
}
