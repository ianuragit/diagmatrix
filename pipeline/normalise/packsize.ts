/**
 * Pack-size parsing: "(48T)", "25 tests", "50 Strips", "96 Wells", "2.0 mL",
 * "5 2.5ml" / "5 x 2.5 mL" (count × volume) → { value, unit, raw }.
 * Never invents a value; returns null when nothing recognisable is present.
 */
import type { PackSize } from '../core/types.ts';

const UNIT_ALIASES: [RegExp, string][] = [
  [/^(t|tests?|tst|det|determinations?|reactions?|rxns?|preps?)$/i, 'tests'],
  [/^(strips?|sticks?|dipsticks?)$/i, 'strips'],
  [/^(cassettes?|devices?|cards?)$/i, 'tests'],
  [/^(wells?)$/i, 'wells'],
  [/^(cartridges?|cart)$/i, 'cartridges'],
  [/^(vials?)$/i, 'vials'],
  [/^(kits?)$/i, 'kits'],
  [/^(pcs|pieces?|units?|nos?)$/i, 'pieces'],
  [/^(ml)$/i, 'mL'],
  [/^(µl|ul|μl)$/i, 'µL'],
  [/^(l)$/i, 'L'],
];

function unitOf(token: string): string | null {
  for (const [re, unit] of UNIT_ALIASES) if (re.test(token)) return unit;
  return null;
}

const NUM = String.raw`(\d+(?:[.,]\d+)?)`;
const UNIT = String.raw`(tests?|t|tst|det|determinations?|reactions?|rxns?|preps?|strips?|sticks?|dipsticks?|cassettes?|devices?|cards?|wells?|cartridges?|vials?|kits?|pcs|pieces?|ml|µl|μl|ul)`;

/** count × volume, e.g. "5 2.5ml", "5 x 2.5 mL", "4×5 mL" */
const MULTI = new RegExp(
  String.raw`(?:^|[\s(])(\d+)\s*(?:x|×|\*)?\s+${NUM}\s*(ml|µl|μl|ul)\b`,
  'i',
);
const MULTI_X = new RegExp(
  String.raw`(?:^|[\s(])(\d+)\s*(?:x|×|\*)\s*${NUM}\s*(ml|µl|μl|ul)\b`,
  'i',
);
/** "(48T)", "48 T", "25 tests", "50 Strips", "96 Wells", "2.0 mL" */
const SINGLE = new RegExp(String.raw`(?:^|[\s(/,-])${NUM}\s*${UNIT}(?=$|[\s),./;-])`, 'i');

const toNum = (s: string) => Number(s.replace(',', '.'));

export function parsePackSize(text: string | null | undefined): PackSize | null {
  if (!text) return null;
  const t = text.trim();
  const multi = MULTI_X.exec(t) ?? MULTI.exec(t);
  if (multi) {
    const count = Number(multi[1]);
    const vol = toNum(multi[2]!);
    const unit = unitOf(multi[3]!)!;
    if (count > 0 && vol > 0)
      return { value: count, unit: `× ${vol} ${unit}`, raw: multi[0].trim().replace(/^\(/, '') };
  }
  const m = SINGLE.exec(t);
  if (!m) return null;
  const value = toNum(m[1]!);
  const unit = unitOf(m[2]!);
  if (!unit || !(value > 0)) return null;
  // "1000 µl" filter tips etc. are a property, not a pack size, unless the whole text is just that.
  return {
    value,
    unit,
    raw: m[0]
      .trim()
      .replace(/^[(/,-]/, '')
      .trim(),
  };
}

/**
 * Removes a trailing/bracketed pack size from a product name:
 * "STANDARD Q HBsAg (30T)" → "STANDARD Q HBsAg"; "… 50 Strips" → "…".
 */
export function stripPackSize(name: string): { name: string; pack: PackSize | null } {
  const bracket =
    /\s*\(\s*(\d+(?:[.,]\d+)?\s*(?:t|tests?|strips?|wells?|cartridges?|pcs|kits?))\s*\)\s*/i;
  const b = bracket.exec(name);
  if (b)
    return {
      name: name.replace(bracket, ' ').replace(/\s+/g, ' ').trim(),
      pack: parsePackSize(b[1]!),
    };
  const trailing = /[\s,-]+(\d+\s*(?:tests?|strips?|t))\s*$/i;
  const tr = trailing.exec(name);
  if (tr) return { name: name.slice(0, tr.index).trim(), pack: parsePackSize(tr[1]!) };
  return { name, pack: null };
}
