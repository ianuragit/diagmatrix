/** Build-time Open Graph card renderer (SVG → PNG via resvg, system fonts). */
import { Resvg } from '@resvg/resvg-js';

const FONT = "Inter, 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!,
  );

function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1]!.replace(/\s*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

export interface OgCard {
  siteName: string;
  kicker?: string | null;
  title: string;
  facts?: string[];
  footer?: string;
}

export function renderOg(card: OgCard): Uint8Array {
  const titleLines = wrap(card.title, card.title.length > 60 ? 30 : 24, 3);
  const size = titleLines.length > 2 ? 58 : 66;
  // Wrap facts at their separators, never inside one fact.
  const facts: string[] = [];
  for (const f of (card.facts ?? []).filter(Boolean)) {
    const last = facts[facts.length - 1];
    if (last && (last + '  ·  ' + f).length <= 62) facts[facts.length - 1] = last + '  ·  ' + f;
    else if (facts.length < 2) facts.push(f.length > 62 ? f.slice(0, 61) + '…' : f);
  }
  const titleY = 250;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F2A43"/><stop offset="1" stop-color="#183A5A"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="14" height="630" fill="#0E7C86"/>
  <g transform="translate(80,70)">
    <rect width="56" height="56" rx="12" fill="#0E7C86"/>
    <path d="M14 28h28M28 14v28" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="42" cy="14" r="5" fill="#F59E0B"/>
    <text x="76" y="40" font-family="${FONT}" font-size="34" font-weight="700" fill="#FFFFFF">${esc(card.siteName)}</text>
  </g>
  ${card.kicker ? `<text x="80" y="${titleY - 60}" font-family="${FONT}" font-size="32" font-weight="700" fill="#5FD0D8">${esc(card.kicker)}</text>` : ''}
  ${titleLines.map((l, i) => `<text x="80" y="${titleY + i * (size + 10)}" font-family="${FONT}" font-size="${size}" font-weight="800" fill="#FFFFFF">${esc(l)}</text>`).join('\n  ')}
  ${facts.map((l, i) => `<text x="80" y="${titleY + titleLines.length * (size + 10) + 40 + i * 40}" font-family="${FONT}" font-size="30" fill="#DCE6EF">${esc(l)}</text>`).join('\n  ')}
  <rect x="80" y="520" width="250" height="58" rx="10" fill="#F59E0B"/>
  <text x="205" y="558" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="700" fill="#0F2A43">Request info</text>
  <text x="1120" y="558" text-anchor="end" font-family="${FONT}" font-size="24" fill="#A9BCCD">${esc(card.footer ?? 'In-vitro diagnostics directory')}</text>
</svg>`;
  return new Resvg(svg, {
    font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' },
    fitTo: { mode: 'width', value: 1200 },
  })
    .render()
    .asPng();
}
