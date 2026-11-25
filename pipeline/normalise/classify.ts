/**
 * Rule-based classification driven by taxonomy.yaml. Structured source values
 * (method, parameter, sample type) are trusted most; then name/spec keywords;
 * then source-category hints; then analyte-derived fallbacks. Each dimension
 * carries a confidence; the record's confidence is their mean.
 */
import { PRODUCT_TYPES } from '../core/types.ts';

type ProductType = (typeof PRODUCT_TYPES)[number];

export interface Taxonomy {
  categories: Record<string, { label: string; intro: string }>;
  subcategories: Record<string, string>;
  source_category_hints: Record<string, Record<string, string>>;
  technology: Record<string, { label: string; category: string; keywords: string[] }>;
  analytes: Record<string, { label: string; group: string; keywords: string[] }>;
  sample_types: Record<string, { label: string; keywords: string[] }>;
  analyte_suppress?: Record<string, string[]>;
  product_types: Record<'control' | 'consumable' | 'instrument' | 'reagent', string[]>;
  subtypes: Record<string, string[]>;
  spec_filters: { drop_keys: string[]; drop_values: string[] };
  spec_key_map: Record<string, string>;
  value_map: Record<string, string>;
  text_fixes: [string, string][];
  scope: {
    exclude_source_categories: Record<string, string[]>;
    exclude_keywords: string[];
    diagnostic_keywords: string[];
  };
}

export interface ClassifyInput {
  source: string;
  name: string;
  /** Source category labels (any language). */
  sourceCategories: string[];
  /** Structured method values, e.g. ["Schnelltest"] or ["Lateral Flow Immunoassay"]. */
  methods: string[];
  /** Structured analyte values (e.g. a "Parameter" list). */
  parameters: string[];
  /** Structured sample-type strings ("Serum/ Plasma/ WB", "Blut, Urin"). */
  samples: string[];
  /** Free text that may mention analytes (e.g. "Function", "Use" specs). */
  extraText: string;
  /** True when the record is a sub-product of an instrument page. */
  isComponent: boolean;
  /** Has physical instrument dimensions (numeric weight/size specs). */
  hasDimensions: boolean;
  /** Lists child tests/consumables of its own (typical of an instrument page). */
  hasComponents?: boolean;
}

export interface Classification {
  technology: string | null;
  analyte: string[];
  sample_type: string[];
  product_type: ProductType | null;
  subtype: string | null;
  category: string;
  subcategory: string | null;
  confidence: number;
  basis: { technology: string; analyte: string; sample: string; type: string };
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const kwRegex = (kw: string) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${esc(kw)}(?![\\p{L}\\p{N}])`, 'iu');

/** Technology priority when several match (most specific first). */
const TECH_PRIORITY = [
  'pcr',
  'lamp',
  'elisa',
  'clia',
  'fia',
  'blood-gas',
  'hematology',
  'esr',
  'coagulation',
  'urinalysis',
  'culture',
  'semen-analysis',
  'diabetes-tech',
  'rdt',
  'clinical-chemistry',
];

const ANALYTE_TECH_FALLBACK: Record<string, string> = {
  'pt-inr': 'coagulation',
  aptt: 'coagulation',
  'blood-gases': 'blood-gas',
  'blood-count': 'hematology',
  hemoglobin: 'hematology',
  hba1c: 'diabetes-tech',
  glucose: 'diabetes-tech',
  ketones: 'diabetes-tech',
  'urine-chemistry': 'urinalysis',
};
const CHEMISTRY_ANALYTES = new Set([
  'crp',
  'lipids',
  'creatinine',
  'urea',
  'uric-acid',
  'liver-enzymes',
  'bilirubin',
  'electrolytes',
  'lactate',
  'cystatin-c',
  'microalbumin',
  'homocysteine',
  'vitamin-d',
  'saa',
  'pct',
  'ferritin',
]);

export class Classifier {
  private readonly tech: { id: string; res: RegExp[] }[];
  private readonly analytes: { id: string; res: RegExp[] }[];
  private readonly samples: { id: string; res: RegExp[] }[];
  private readonly types: Record<string, RegExp[]>;
  private readonly subtypes: { id: string; res: RegExp[] }[];

  constructor(readonly tax: Taxonomy) {
    const compile = (o: Record<string, { keywords: string[] }>) =>
      Object.entries(o).map(([id, v]) => ({ id, res: v.keywords.map(kwRegex) }));
    this.tech = compile(tax.technology).sort((a, b) => rank(a.id) - rank(b.id));
    this.analytes = compile(tax.analytes);
    this.samples = compile(tax.sample_types);
    this.types = Object.fromEntries(
      Object.entries(tax.product_types).map(([k, v]) => [k, v.map(kwRegex)]),
    );
    this.subtypes = Object.entries(tax.subtypes).map(([id, kws]) => ({
      id,
      res: kws.map(kwRegex),
    }));
  }

  private matchAll(list: { id: string; res: RegExp[] }[], text: string): string[] {
    return list.filter((x) => x.res.some((r) => r.test(text))).map((x) => x.id);
  }

  private suppress(ids: string[]): string[] {
    const drop = new Set(ids.flatMap((id) => this.tax.analyte_suppress?.[id] ?? []));
    return ids.filter((id) => !drop.has(id));
  }

  analytesFrom(values: string[], text: string): { ids: string[]; conf: number; basis: string } {
    const r = this.analytesRaw(values, text);
    return { ...r, ids: this.suppress(r.ids) };
  }

  private analytesRaw(
    values: string[],
    text: string,
  ): { ids: string[]; conf: number; basis: string } {
    const structured = [...new Set(values.flatMap((v) => this.matchAll(this.analytes, v)))];
    if (structured.length) return { ids: structured, conf: 1, basis: 'structured' };
    const fromText = this.matchAll(this.analytes, text);
    if (fromText.length) return { ids: fromText, conf: 0.75, basis: 'keyword' };
    return { ids: [], conf: 0.3, basis: 'none' };
  }

  samplesFrom(values: string[], name: string): { ids: string[]; conf: number; basis: string } {
    const split = values
      .flatMap((v) => v.split(/[\/,;]| and | or |\+/i))
      .map((s) => s.trim())
      .filter(Boolean);
    let ids = [...new Set(split.flatMap((v) => this.matchAll(this.samples, v)))];
    let conf = 1;
    let basis = 'structured';
    if (!ids.length) {
      ids = this.matchAll(this.samples, name).filter(
        (id) => id !== 'whole-blood' || /whole blood|\bwb\b/i.test(name),
      );
      conf = ids.length ? 0.7 : 0.4;
      basis = ids.length ? 'keyword' : 'none';
    }
    if (ids.some((i) => ['nasal-swab', 'nasopharyngeal-swab', 'throat-swab'].includes(i)))
      ids = ids.filter((i) => i !== 'swab');
    const order = Object.keys(this.tax.sample_types);
    return { ids: ids.sort((a, b) => order.indexOf(a) - order.indexOf(b)), conf, basis };
  }

  classify(input: ClassifyInput): Classification {
    const nameText = input.name;
    const analyte = this.analytesFrom(input.parameters, `${nameText} ${input.extraText}`);
    const sample = this.samplesFrom(input.samples, nameText);
    // On urine strips, "erythrocytes/leukocytes/haemoglobin" are strip pads, not a blood count.
    if (
      sample.ids.length === 1 &&
      sample.ids[0] === 'urine' &&
      analyte.ids.some((a) => a === 'blood-count' || a === 'hemoglobin')
    ) {
      analyte.ids = [
        ...new Set(
          analyte.ids.map((a) =>
            a === 'blood-count' || a === 'hemoglobin' ? 'urine-chemistry' : a,
          ),
        ),
      ];
    }

    // Technology
    let technology: string | null = null;
    let techConf = 0.2;
    let techBasis = 'none';
    const fromMethods = this.matchAll(this.tech, input.methods.join(' | '));
    const fromName = this.matchAll(this.tech, nameText);
    const hints = this.tax.source_category_hints[input.source] ?? {};
    const fromHint = input.sourceCategories.map((c) => hints[c]).filter((x): x is string => !!x);
    if (fromMethods.length) {
      // "rapid test" + "urinalysis": urinalysis only for urine-chemistry strips; otherwise a rapid test on urine.
      let pick = fromMethods[0]!;
      if (
        pick === 'urinalysis' &&
        fromMethods.includes('rdt') &&
        !analyte.ids.includes('urine-chemistry')
      )
        pick = 'rdt';
      [technology, techConf, techBasis] = [pick, 1, 'structured'];
    } else if (fromName.length) [technology, techConf, techBasis] = [fromName[0]!, 0.8, 'keyword'];
    else if (fromHint.length)
      [technology, techConf, techBasis] = [
        fromHint.sort((a, b) => rank(a) - rank(b))[0]!,
        0.7,
        'category',
      ];
    // Structured "rapid test" + a specific name keyword (e.g. "FIA") → the specific one.
    if (technology === 'rdt' && fromName.length && fromName[0] !== 'rdt') technology = fromName[0]!;
    if (!technology) {
      const fb = analyte.ids.map((a) => ANALYTE_TECH_FALLBACK[a]).find(Boolean);
      if (fb) [technology, techConf, techBasis] = [fb, 0.6, 'analyte'];
      else if (input.hasDimensions && analyte.ids.some((a) => CHEMISTRY_ANALYTES.has(a)))
        [technology, techConf, techBasis] = ['clinical-chemistry', 0.6, 'analyte'];
    }

    // Product type
    const t = (k: string) => (this.types[k] ?? []).some((r) => r.test(nameText));
    const strongReagent =
      /\b(kit|assay|strips?|cartridges?|cassettes?|card|test device|self[- ]test|rapid test|elisa|clia)\b/i.test(
        nameText,
      );
    let product_type: ProductType | null = null;
    let typeConf = 0.4;
    let typeBasis = 'none';
    if (t('control')) [product_type, typeConf, typeBasis] = ['reagent', 0.95, 'keyword:control'];
    else if (t('consumable') && !strongReagent)
      [product_type, typeConf, typeBasis] = ['consumable', 0.85, 'keyword'];
    else if (input.isComponent) [product_type, typeConf, typeBasis] = ['reagent', 0.9, 'component'];
    else if (t('instrument') && !strongReagent)
      [product_type, typeConf, typeBasis] = ['instrument', 0.9, 'keyword'];
    else if (strongReagent || t('reagent'))
      [product_type, typeConf, typeBasis] = ['reagent', 0.85, 'keyword'];
    else if (
      !input.hasDimensions &&
      input.methods.some((m) => /schnelltest|rapid test|lateral flow/i.test(m))
    )
      [product_type, typeConf, typeBasis] = ['reagent', 0.85, 'structured'];
    else if (input.hasComponents && !input.methods.some((m) => /schnelltest|rapid test/i.test(m)))
      [product_type, typeConf, typeBasis] = ['instrument', 0.8, 'structured'];
    else if (
      input.hasDimensions ||
      input.methods.some((m) =>
        /reader|multiparameter|einzelparameter|blutbild|diff|oxymetrie|bga/i.test(m),
      )
    )
      [product_type, typeConf, typeBasis] = ['instrument', 0.8, 'structured'];
    else if (
      technology &&
      ['rdt', 'elisa', 'clia', 'fia'].includes(technology) &&
      !input.hasDimensions
    )
      [product_type, typeConf, typeBasis] = ['reagent', 0.6, 'technology'];

    let subtype: string | null = null;
    if (product_type !== 'instrument')
      subtype = this.subtypes.find((s) => s.res.some((r) => r.test(nameText)))?.id ?? null;

    const category = technology
      ? (this.tax.technology[technology]?.category ?? 'general')
      : 'general';
    const subcategory =
      subtype === 'control' || subtype === 'calibrator' ? 'control' : product_type;
    const confidence =
      Math.round(((analyte.conf + techConf + typeConf + sample.conf) / 4) * 100) / 100;

    return {
      technology,
      analyte: analyte.ids,
      sample_type: sample.ids,
      product_type,
      subtype,
      category,
      subcategory,
      confidence,
      basis: {
        technology: techBasis,
        analyte: analyte.basis,
        sample: sample.basis,
        type: typeBasis,
      },
    };
  }

  /** Scope check: is this record outside "diagnostics"? Returns the reason or null. */
  outOfScope(source: string, sourceCategories: string[], name: string): string | null {
    const excluded = this.tax.scope.exclude_source_categories[source] ?? [];
    const cat = sourceCategories.find((c) => excluded.includes(c));
    if (cat) return `source category "${cat}"`;
    const bad = this.tax.scope.exclude_keywords.find((k) => kwRegex(k).test(name));
    const good = this.tax.scope.diagnostic_keywords.some((k) => kwRegex(k).test(name));
    if (bad && !good) return `keyword "${bad}"`;
    return null;
  }
}

function rank(id: string): number {
  const i = TECH_PRIORITY.indexOf(id);
  return i < 0 ? 99 : i;
}
