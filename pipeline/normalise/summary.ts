/**
 * Short, original, factual summaries built ONLY from normalised fields — never
 * from source prose. Unknown fields are simply left out.
 */
import type { PackSize } from '../core/types.ts';

const TECH_NOUN: Record<string, { reagent: string; instrument: string }> = {
  rdt: { reagent: 'lateral-flow rapid test', instrument: 'rapid-test reader' },
  elisa: { reagent: 'ELISA kit', instrument: 'ELISA instrument' },
  clia: {
    reagent: 'chemiluminescence immunoassay (CLIA) reagent',
    instrument: 'chemiluminescence immunoassay analyser',
  },
  fia: {
    reagent: 'fluorescence immunoassay (FIA) test',
    instrument: 'fluorescence immunoassay analyser',
  },
  pcr: { reagent: 'PCR assay', instrument: 'PCR system' },
  lamp: {
    reagent: 'isothermal (LAMP) assay',
    instrument: 'isothermal amplification (LAMP) system',
  },
  'clinical-chemistry': {
    reagent: 'clinical chemistry reagent',
    instrument: 'clinical chemistry analyser',
  },
  hematology: { reagent: 'hematology reagent', instrument: 'hematology analyser' },
  coagulation: { reagent: 'coagulation test', instrument: 'coagulation analyser' },
  'blood-gas': { reagent: 'blood gas test consumable', instrument: 'blood gas analyser' },
  urinalysis: { reagent: 'urine test strip', instrument: 'urine analyser' },
  'diabetes-tech': { reagent: 'glucose/HbA1c test', instrument: 'glucose/HbA1c analyser' },
  culture: { reagent: 'culture and susceptibility test', instrument: 'microbiology instrument' },
};

const list = (items: string[], max = 5): string => {
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  if (more > 0) return `${shown.join(', ')} and ${more} more`;
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
};

const article = (w: string) =>
  /^(uri|uni|use|eu|one)/i.test(w)
    ? 'a'
    : /^[aeiou]/i.test(w) || /^(FIA|ELISA|LAMP|HbA1c|RSV|HIV|H\.|hCG)/.test(w)
      ? 'an'
      : 'a';

export interface SummaryInput {
  brand: string | null;
  name: string;
  technology: string | null;
  product_type: 'instrument' | 'reagent' | 'consumable' | null;
  subtype: string | null;
  analyteLabels: string[];
  sampleLabels: string[];
  pack_size: PackSize | null;
  parentName?: string | null;
}

export function buildSummary(s: SummaryInput): string | null {
  const title = [s.brand, s.name].filter(Boolean).join(' ');
  if (!s.product_type && !s.technology && !s.analyteLabels.length) return null;

  let noun: string;
  if (s.subtype === 'control') noun = 'quality control material';
  else if (s.subtype === 'calibrator') noun = 'calibrator';
  else if (s.product_type === 'consumable') noun = 'laboratory consumable';
  else if (s.technology && TECH_NOUN[s.technology])
    noun = TECH_NOUN[s.technology]![s.product_type === 'instrument' ? 'instrument' : 'reagent'];
  else if (s.subtype === 'cartridge') noun = 'test cartridge';
  else if (s.subtype === 'strip') noun = 'test strip';
  else
    noun = s.product_type === 'instrument' ? 'diagnostic instrument' : 'in-vitro diagnostic test';
  if (s.subtype === 'self-test' && s.product_type === 'reagent') noun = `self-test (${noun})`;

  const parts: string[] = [];
  let first = `${title} is ${article(noun)} ${noun}`;
  if (s.analyteLabels.length) {
    first +=
      s.product_type === 'instrument'
        ? ` that measures ${list(s.analyteLabels)}`
        : ` for ${list(s.analyteLabels)}`;
  }
  if (s.parentName) first += `, used with the ${s.parentName}`;
  parts.push(first + '.');
  if (s.sampleLabels.length)
    parts.push(
      `Sample type: ${list(
        s.sampleLabels.map((x) => x.toLowerCase()),
        6,
      )}.`,
    );
  if (s.pack_size) {
    const u = s.pack_size.unit.startsWith('×')
      ? `${s.pack_size.value} ${s.pack_size.unit}`
      : `${s.pack_size.value} ${s.pack_size.unit}`;
    parts.push(`Pack size: ${u}.`);
  }
  return parts.join(' ');
}
