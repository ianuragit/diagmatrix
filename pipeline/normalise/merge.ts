/**
 * build-data core: raw records (+ hand-added products) → public catalogue.
 *
 *  1. text fixes on names            6. stable ids (persisted id map)
 *  2. expand instrument components   7. dedupe: same-source duplicates flagged,
 *  3. scope filter (diagnostics)        cross-source matches merged by priority
 *  4. brand split, pack size         8. related[] (components, source links,
 *  5. classify; clean public specs      product line, same analyte other brand)
 *                                    9. summaries, overrides (applied last)
 *
 * Public output never contains source names, URLs, record ids or source images;
 * that provenance is returned separately for the git-ignored private file.
 */
import { createHash } from 'node:crypto';
import type { PackSize, Product, ProductDocument, RawProduct, SourceRef } from '../core/types.ts';
import { ProductSchema } from '../core/types.ts';
import { createIdAllocator, slugify } from '../core/slug.ts';
import { BrandMatcher, type BrandConfig } from './brand.ts';
import { Classifier, kwRegex, type Classification, type Taxonomy } from './classify.ts';
import { parsePackSize, stripPackSize } from './packsize.ts';
import { dedupeKey } from './dedupe.ts';
import { buildSummary } from './summary.ts';
import { Translator, type TranslationConfig } from './translate.ts';

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface ManualProduct {
  name: string;
  brand?: string | null;
  catalogue_no?: string | null;
  pack_size?: string | null;
  sample_type?: string | null;
  analytes?: string[];
  technology?: string | null;
  product_type?: 'instrument' | 'reagent' | 'consumable' | null;
  specs?: Record<string, string>;
  documents?: ProductDocument[];
  file: string;
}

export interface BuildInput {
  /** Raw records per source id, with that source's priority (lower wins). */
  sources: { id: string; priority: number; hosts: string[]; records: RawProduct[] }[];
  manual: ManualProduct[];
  brands: BrandConfig;
  taxonomy: Taxonomy;
  overrides: Record<string, Partial<Product>>;
  idMap: Map<string, string>;
  /**
   * Give products whose name changed (e.g. after translation) a fresh slug that
   * matches their name; the old slug becomes a redirect. One-off, opt-in.
   */
  reslug?: boolean;
  /** Extra private terms (company names) that must never be published. */
  privateTerms: string[];
  /** German → English for display text (pipeline/config/translations.yaml). */
  translations?: TranslationConfig;
}

export interface DroppedRecord {
  name: string;
  source: string;
  reason: string;
}

export interface BuildReport {
  dropped: DroppedRecord[];
  brandConflicts: { id: string; name: string; brand: string; stated: string }[];
  unknownStatedBrands: { brand: string; count: number }[];
  noBrand: { id: string; name: string }[];
  lowConfidence: { id: string; name: string; confidence: number; basis: Classification['basis'] }[];
  componentsExpanded: number;
  componentsMatchedToPages: number;
  overridesApplied: string[];
  overridesUnknown: string[];
  /** Display text that still looks non-English after translation. */
  untranslated: { id: string; field: string; text: string; words: string[] }[];
}

export interface BuildOutput {
  products: Product[];
  duplicates: {
    duplicate_groups: {
      key: string;
      brand: string | null;
      canonical: string;
      members: { id: string; name: string }[];
    }[];
    cross_source_merges: { id: string; name: string; listings: number }[];
  };
  provenance: Record<string, SourceRef[]>;
  idMap: Map<string, string>;
  /** old id → new id, for ids that stopped being products in this build (merged or re-slugged). */
  redirects: Record<string, string>;
  report: BuildReport;
}

// ---------------------------------------------------------------------------
// Internal candidate
// ---------------------------------------------------------------------------

interface Candidate {
  ref: SourceRef; // private
  refKey: string; // `${source}:${source_id}` — private
  priority: number;
  name: string;
  statedBrand: string | null;
  catalogue_no: string | null;
  specs: Record<string, string>;
  facts: Record<string, string>;
  sourceCategories: string[];
  documents: ProductDocument[];
  isComponent: boolean;
  parentRefKey: string | null;
  relatedRefKeys: string[];
  componentSamples: string[];
  fetched_at: string;
  manual?: ManualProduct;
}

interface Normalised {
  c: Candidate;
  brand: string | null;
  product_line: string | null;
  name: string;
  pack_size: PackSize | null;
  cls: Classification;
  specs: Record<string, string>;
  documents: ProductDocument[];
  catalogue_no: string | null;
  key: string;
  filled: number;
}

const hashKey = (refKey: string) => createHash('sha1').update(refKey).digest('hex').slice(0, 16);
const splitList = (v: string | undefined) =>
  v
    ? v
        .split(/,\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export function build(input: BuildInput): BuildOutput {
  const tax = input.taxonomy;
  const brands = new BrandMatcher(input.brands);
  const classifier = new Classifier(tax);
  const fixes = tax.text_fixes.map(([re, to]) => [new RegExp(re, 'g'), to] as const);
  const fixText = (s: string) =>
    fixes
      .reduce((acc, [re, to]) => acc.replace(re, to), s)
      .replace(/\s+/g, ' ')
      .trim();
  const report: BuildReport = {
    dropped: [],
    brandConflicts: [],
    unknownStatedBrands: [],
    noBrand: [],
    lowConfidence: [],
    componentsExpanded: 0,
    componentsMatchedToPages: 0,
    overridesApplied: [],
    overridesUnknown: [],
    untranslated: [],
  };
  const tr = new Translator(input.translations ?? {});

  const privateHosts = input.sources.flatMap((s) =>
    s.hosts.map((h) => h.replace(/^www\./, '').toLowerCase()),
  );
  const privateRes = input.privateTerms.map((t) => kwRegex(t));
  const isPrivateUrl = (u: string) => {
    try {
      const h = new URL(u).hostname.toLowerCase();
      return (
        privateHosts.some((p) => h === p || h.endsWith(`.${p}`)) ||
        input.privateTerms.some((t) => h.includes(t.replace(/\s+/g, '')))
      );
    } catch {
      return true;
    }
  };
  const mentionsPrivate = (s: string) => privateRes.some((r) => r.test(s));

  // 1–2. Candidates, with components expanded -------------------------------
  const candidates = new Map<string, Candidate>();
  const parentsOf = new Map<string, string>();
  for (const src of [...input.sources].sort((a, b) => a.priority - b.priority)) {
    const byId = new Map(src.records.map((r) => [r.source_id, r]));
    for (const r of src.records) {
      const refKey = `${src.id}:${r.source_id}`;
      candidates.set(refKey, {
        ref: {
          source: src.id,
          source_id: r.source_id,
          url: r.url,
          fetched_at: r.fetched_at,
          image: r.image,
        },
        refKey,
        priority: src.priority,
        name: tr.name(fixText(r.name)),
        statedBrand: r.brand,
        catalogue_no:
          r.catalogue_no && r.catalogue_no !== r.source_id ? r.catalogue_no.trim() : null,
        specs: r.specs,
        facts: r.facts,
        sourceCategories: [r.category, r.subcategory, ...splitList(r.facts['Categories'])].filter(
          (x): x is string => !!x,
        ),
        documents: r.documents,
        isComponent: false,
        parentRefKey: null,
        relatedRefKeys: r.related_source_ids.map((id) => `${src.id}:${id}`),
        componentSamples: r.components.flatMap((c) =>
          splitList(c.specs['Probentyp'] ?? c.specs['Sample type']),
        ),
        fetched_at: r.fetched_at,
      });
    }
    for (const r of src.records) {
      const parentKey = `${src.id}:${r.source_id}`;
      for (const comp of r.components) {
        const compKey = `${src.id}:${comp.source_id}`;
        if (compKey === parentKey) continue; // a page listing itself as its own "test"
        // Same name as the instrument page itself (e.g. "XN-330" under "XN-330"): a self-listing, not a reagent.
        if (dedupeKey(fixText(comp.name), null) === dedupeKey(fixText(r.name), null)) continue;
        parentsOf.set(compKey, parentKey);
        if (byId.has(comp.source_id)) {
          report.componentsMatchedToPages++;
          continue;
        }
        if (candidates.has(compKey)) continue;
        report.componentsExpanded++;
        candidates.set(compKey, {
          ref: {
            source: src.id,
            source_id: comp.source_id,
            url: r.url,
            fetched_at: r.fetched_at,
            image: null,
          },
          refKey: compKey,
          priority: src.priority,
          name: tr.name(fixText(comp.name)),
          statedBrand: r.brand,
          catalogue_no: null,
          specs: comp.specs,
          facts: {},
          sourceCategories: [],
          documents: [],
          isComponent: true,
          parentRefKey: parentKey,
          relatedRefKeys: [],
          componentSamples: [],
          fetched_at: r.fetched_at,
        });
      }
    }
  }
  for (const [k, p] of parentsOf) {
    const c = candidates.get(k);
    if (c) c.parentRefKey = p;
  }
  for (const m of input.manual) {
    const refKey = `manual:${slugify(m.file)}-${slugify(m.name)}`;
    candidates.set(refKey, {
      ref: {
        source: 'manual',
        source_id: refKey.slice(7),
        url: null,
        fetched_at: new Date().toISOString(),
        image: null,
      },
      refKey,
      priority: -1,
      name: tr.name(fixText(m.name)),
      statedBrand: m.brand ?? null,
      catalogue_no: m.catalogue_no ?? null,
      specs: m.specs ?? {},
      facts: {
        ...(m.pack_size ? { 'Pack Size': m.pack_size } : {}),
        ...(m.sample_type ? { 'Sample Type': m.sample_type } : {}),
      },
      sourceCategories: [],
      documents: m.documents ?? [],
      isComponent: false,
      parentRefKey: null,
      relatedRefKeys: [],
      componentSamples: [],
      fetched_at: new Date().toISOString(),
      manual: m,
    });
  }

  // 3–5. Scope, brand, pack, classify, clean ---------------------------------
  const resolvedBrand = new Map<string, string | null>();
  const normalised: Normalised[] = [];
  const unknownStated = new Map<string, number>();
  const clsByRef = new Map<string, Classification>();
  const hasChildren = new Set(parentsOf.values());
  const depth = (c: Candidate) => (c.isComponent ? 2 : c.parentRefKey ? 1 : 0);
  const ordered = [...candidates.values()].sort((a, b) => depth(a) - depth(b));
  for (const c of ordered) {
    const out = c.isComponent
      ? null
      : classifier.outOfScope(c.ref.source, c.sourceCategories, c.name);
    const parentOut = c.isComponent && !!c.parentRefKey && !resolvedBrand.has(c.parentRefKey);
    if (out || parentOut) {
      report.dropped.push({
        name: c.name,
        source: c.ref.source,
        reason: out ?? 'parent out of scope',
      });
      continue;
    }
    const stated =
      c.isComponent && c.parentRefKey
        ? (resolvedBrand.get(c.parentRefKey) ?? c.statedBrand)
        : c.statedBrand;
    const b = brands.match(c.name, stated);
    resolvedBrand.set(c.refKey, b.brand);
    if (b.unknownStated && !c.isComponent) {
      const k = b.brand ?? b.unknownStated;
      unknownStated.set(k, (unknownStated.get(k) ?? 0) + 1);
    }

    const stripped = stripPackSize(b.name);
    const pack =
      parsePackSize(c.facts['Pack Size'] ?? c.facts['Pack size'] ?? null) ?? stripped.pack;

    const specs = c.specs;
    const methods = [
      ...splitList(specs['Methode'] ?? specs['Method']),
      specs['Technology'],
      specs['Instruments Type'],
      specs['Equipment Type'],
      c.manual?.technology ? (tax.technology[c.manual.technology]?.keywords[0] ?? '') : '',
    ].filter((x): x is string => !!x);
    const parameters = [...splitList(specs['Parameter']), ...(c.manual?.analytes ?? [])];
    // Fact table wins outright; the spec list is only a fallback (it is often filler).
    const samples = (
      c.facts['Sample Type']
        ? [c.facts['Sample Type']]
        : [specs['Sample Type'], specs['Probentyp'], ...c.componentSamples]
    ).filter((x): x is string => !!x);
    const hasDimensions = Object.entries(specs).some(
      ([k, v]) => /^(weight|depth|width|height)\s*\(/i.test(k) && /^\d/.test(v),
    );
    let cls = classifier.classify({
      source: c.ref.source,
      name: stripped.name,
      sourceCategories: c.sourceCategories,
      methods,
      parameters,
      samples,
      extraText: [specs['Function'], specs['Use'], specs['Application'], c.facts['Application']]
        .filter(Boolean)
        .join(' | '),
      isComponent: c.isComponent || (!!c.parentRefKey && !hasDimensions),
      hasDimensions,
      hasComponents: hasChildren.has(c.refKey),
    });
    // Child tests/strips inherit their instrument's technology when they have none.
    const parentCls = c.parentRefKey ? clsByRef.get(c.parentRefKey) : undefined;
    const weakTech =
      !cls.technology || cls.basis.technology === 'analyte' || cls.basis.technology === 'category';
    const strongParent =
      parentCls?.technology && ['structured', 'keyword'].includes(parentCls.basis.technology);
    if ((weakTech && strongParent) || (!cls.technology && parentCls?.technology)) {
      cls = {
        ...cls,
        technology: parentCls!.technology,
        category: parentCls!.category,
        basis: { ...cls.basis, technology: 'parent' },
      };
      cls.confidence = Math.round(Math.min(1, cls.confidence + 0.1) * 100) / 100;
    }
    clsByRef.set(c.refKey, cls);
    if (c.manual?.product_type)
      cls = {
        ...cls,
        product_type: c.manual.product_type,
        subcategory: cls.subtype === 'control' ? 'control' : c.manual.product_type,
      };

    normalised.push({
      c,
      brand: b.brand,
      product_line: b.product_line,
      name: stripped.name,
      pack_size: pack,
      cls,
      specs: publicSpecs(c, tax, mentionsPrivate, tr),
      documents: c.documents
        .filter(
          (d) =>
            ['pdf', 'manual', 'brochure', 'datasheet', 'ifu'].includes(d.type) &&
            !isPrivateUrl(d.url),
        )
        .map((d) => ({ ...d, title: tr.text(d.title) })),
      catalogue_no: c.catalogue_no,
      key: dedupeKey(stripped.name, b.brand),
      filled: Object.keys(c.specs).length + Object.keys(c.facts).length + (c.catalogue_no ? 2 : 0),
    });
    if (
      b.conflict &&
      !report.brandConflicts.some((x) => x.name === c.name && x.stated === b.conflict)
    )
      report.brandConflicts.push({
        id: c.refKey,
        name: c.name,
        brand: b.brand ?? '',
        stated: b.conflict,
      });
  }
  report.unknownStatedBrands = [...unknownStated]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);

  // 6–7. Group, merge, flag duplicates, allocate ids ---------------------------
  const groups = new Map<string, Normalised[]>();
  for (const n of normalised) {
    const k = `${(n.brand ?? '').toLowerCase()}|${n.key || hashKey(n.c.refKey)}`;
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(n);
  }
  // An instrument and a reagent/consumable are never the same product.
  for (const [k, members] of [...groups]) {
    const types = [
      ...new Set(
        members.map((m) => m.cls.product_type).filter((t): t is NonNullable<typeof t> => !!t),
      ),
    ];
    if (types.length < 2) continue;
    groups.delete(k);
    for (const t of types)
      groups.set(
        `${k}|${t}`,
        members.filter((m) => m.cls.product_type === t),
      );
    const untyped = members.filter((m) => !m.cls.product_type);
    if (untyped.length) groups.get(`${k}|${types[0]}`)!.push(...untyped);
  }
  // Different manufacturer catalogue numbers are never the same product.
  for (const [k, members] of [...groups]) {
    const cats = [
      ...new Set(members.map((m) => m.catalogue_no?.toUpperCase()).filter((x): x is string => !!x)),
    ];
    if (cats.length < 2) continue;
    groups.delete(k);
    for (const cat of cats)
      groups.set(
        `${k}|${cat}`,
        members.filter((m) => m.catalogue_no?.toUpperCase() === cat),
      );
    const loose = members.filter((m) => !m.catalogue_no);
    if (loose.length) groups.get(`${k}|${cats[0]}`)!.push(...loose);
  }
  const allocRaw = createIdAllocator(input.idMap);
  const redirects: Record<string, string> = {};
  const alloc = (key: string, display: string) => {
    const existing = input.idMap.get(key);
    const ideal = slugify(display) || 'product';
    if (input.reslug && existing && existing !== ideal && !existing.startsWith(`${ideal}-`)) {
      input.idMap.delete(key);
      const fresh = allocRaw(key, display);
      redirects[existing] = fresh;
      return fresh;
    }
    return allocRaw(key, display);
  };
  const products: Product[] = [];
  const provenance: Record<string, SourceRef[]> = {};
  const refToId = new Map<string, string>();
  const duplicateGroups: BuildOutput['duplicates']['duplicate_groups'] = [];
  const crossMerges: BuildOutput['duplicates']['cross_source_merges'] = [];
  const productLineOf = new Map<string, string | null>();
  const parentIdOf = new Map<string, string[]>(); // product id → parent product ids
  const pendingParent: [string, string][] = [];
  const pendingRelated: [string, string[]][] = [];

  const best = (xs: Normalised[]) =>
    [...xs].sort(
      (a, b) =>
        b.filled - a.filled ||
        a.c.ref.source_id.localeCompare(b.c.ref.source_id, 'en', { numeric: true }),
    )[0]!;

  for (const members of groups.values()) {
    const bySource = new Map<string, Normalised[]>();
    for (const m of members)
      (bySource.get(m.c.ref.source) ?? bySource.set(m.c.ref.source, []).get(m.c.ref.source)!).push(
        m,
      );
    // One representative per source (a standalone page if there is one). Other
    // standalone pages of that source are duplicates; extra component listings
    // (the same assay under several instruments) are the same product → absorbed.
    const reps = [...bySource.values()]
      .map((xs) =>
        best(xs.filter((x) => !x.c.isComponent).length ? xs.filter((x) => !x.c.isComponent) : xs),
      )
      .sort((a, b) => a.c.priority - b.c.priority);
    const absorbed = members.filter((m) => !reps.includes(m) && m.c.isComponent);
    const primary = reps[0]!;
    const display = displayName(primary);
    const id = alloc(hashKey(primary.c.refKey), display);
    const merged = mergeRecords(reps);
    const now = latest(members.map((m) => m.c.fetched_at));

    const product: Product = {
      id,
      slug: id,
      name: primary.name,
      brand: primary.brand,
      product_line: merged.product_line,
      category: merged.cls.category,
      subcategory: merged.cls.subcategory,
      technology: merged.cls.technology,
      analyte: merged.cls.analyte,
      sample_type: merged.cls.sample_type,
      product_type: merged.cls.product_type,
      subtype: merged.cls.subtype,
      pack_size: merged.pack_size,
      catalogue_no: merged.catalogue_no,
      specs: merged.specs,
      summary: null,
      image_local: null,
      documents: merged.documents,
      related: [],
      source_count: members.filter((m) => m.c.ref.source !== 'manual').length,
      duplicate_of: null,
      classification_confidence: merged.cls.confidence,
      updated_at: now.slice(0, 10),
    };
    products.push(product);
    provenance[id] = reps.map((r) => r.c.ref);
    for (const r of reps) refToId.set(r.c.refKey, id);
    productLineOf.set(id, product.product_line);
    if (reps.length > 1) crossMerges.push({ id, name: display, listings: reps.length });

    // Same-source duplicates → own records pointing at the canonical product.
    for (const a of absorbed) {
      refToId.set(a.c.refKey, id);
      if (a.c.parentRefKey) pendingParent.push([id, a.c.parentRefKey]);
    }
    const dupes = members.filter((m) => !reps.includes(m) && !absorbed.includes(m));
    if (dupes.length) {
      const memberIds: { id: string; name: string }[] = [{ id, name: display }];
      for (const d of dupes) {
        const did = alloc(hashKey(d.c.refKey), displayName(d));
        refToId.set(d.c.refKey, did);
        provenance[did] = [d.c.ref];
        products.push({
          ...product,
          id: did,
          slug: did,
          name: d.name,
          pack_size: d.pack_size ?? product.pack_size,
          related: [],
          duplicate_of: id,
          source_count: 1,
        });
        memberIds.push({ id: did, name: displayName(d) });
      }
      duplicateGroups.push({
        key: primary.key,
        brand: primary.brand,
        canonical: id,
        members: memberIds,
      });
    }
    for (const r of reps) {
      if (r.c.parentRefKey) pendingParent.push([id, r.c.parentRefKey]);
      if (r.c.relatedRefKeys.length) pendingRelated.push([id, r.c.relatedRefKeys]);
    }
  }

  // 8. Related ------------------------------------------------------------------
  const byId = new Map(products.map((p) => [p.id, p]));
  const childrenOf = new Map<string, Set<string>>();
  for (const [childId, parentRef] of pendingParent) {
    const pid = refToId.get(parentRef);
    if (!pid || pid === childId) continue;
    const ps = parentIdOf.get(childId) ?? [];
    if (!ps.includes(pid)) ps.push(pid);
    parentIdOf.set(childId, ps);
    (childrenOf.get(pid) ?? childrenOf.set(pid, new Set()).get(pid)!).add(childId);
  }
  const sourceRelated = new Map<string, string[]>();
  for (const [pid, refs] of pendingRelated)
    sourceRelated.set(
      pid,
      refs.map((r) => refToId.get(r)).filter((x): x is string => !!x),
    );
  const canon = (id: string) => byId.get(id)?.duplicate_of ?? id;
  const live = products.filter((p) => !p.duplicate_of);
  for (const p of live) {
    const out: string[] = [];
    const push = (ids: Iterable<string>) => {
      for (const raw of ids) {
        const id = canon(raw);
        if (id !== p.id && !out.includes(id) && byId.has(id) && out.length < 8) out.push(id);
      }
    };
    push(parentIdOf.get(p.id) ?? []);
    push(childrenOf.get(p.id) ?? []);
    push(sourceRelated.get(p.id) ?? []);
    if (p.product_line)
      push(
        live
          .filter(
            (q) =>
              q.brand === p.brand &&
              q.product_line === p.product_line &&
              overlap(q.analyte, p.analyte),
          )
          .map((q) => q.id),
      );
    if (p.analyte.length)
      push(
        live
          .filter(
            (q) =>
              q.brand !== p.brand &&
              q.product_type === p.product_type &&
              overlap(q.analyte, p.analyte),
          )
          .map((q) => q.id),
      );
    p.related = out;
  }

  // 9. Summaries, then overrides (last) -------------------------------------------
  const analyteLabel = (a: string) => tax.analytes[a]?.label ?? a;
  const sampleLabel = (s: string) => tax.sample_types[s]?.label ?? s;
  for (const p of products) {
    const parents = (parentIdOf.get(p.id) ?? [])
      .map((x) => byId.get(x))
      .filter((x): x is Product => !!x);
    const parentP = parents.length === 1 ? parents[0] : undefined;
    p.summary = buildSummary({
      brand: p.brand,
      name: p.name,
      technology: p.technology,
      product_type: p.product_type,
      subtype: p.subtype,
      analyteLabels: p.analyte.map(analyteLabel),
      sampleLabels: p.sample_type.map(sampleLabel),
      pack_size: p.pack_size,
      parentName: parentP
        ? [parentP.brand, parentP.name].filter(Boolean).join(' ')
        : parents.length > 1
          ? `${parents[0]!.brand ? parents[0]!.brand + ' ' : ''}${parents.map((x) => x.name).join(', ')} systems`
          : null,
    });
    if (!p.brand) report.noBrand.push({ id: p.id, name: p.name });
    if (p.classification_confidence < 0.6 && !p.duplicate_of) {
      const n = normalised.find((x) => refToId.get(x.c.refKey) === p.id);
      if (n)
        report.lowConfidence.push({
          id: p.id,
          name: displayName(n),
          confidence: p.classification_confidence,
          basis: n.cls.basis,
        });
    }
  }
  for (const [id, patch] of Object.entries(input.overrides ?? {})) {
    const p = byId.get(id);
    if (!p) {
      report.overridesUnknown.push(id);
      continue;
    }
    Object.assign(p, patch, { id: p.id, slug: p.slug });
    report.overridesApplied.push(id);
  }
  // Anything still non-English is reported (and `pnpm validate` fails on it).
  for (const p of products) {
    const check = (field: string, text: string | null | undefined) => {
      if (!text) return;
      const words = tr.leftovers(text);
      if (words.length)
        report.untranslated.push({ id: p.id, field, text: text.slice(0, 120), words });
    };
    check('name', p.name);
    check('summary', p.summary);
    for (const [k, v] of Object.entries(p.specs)) {
      check(`specs.key`, k);
      check(`specs.${k}`, v);
    }
    for (const d of p.documents) check('documents.title', d.title);
  }
  // Brand-conflict report keyed by public id.
  report.brandConflicts = report.brandConflicts.map((c) => ({ ...c, id: refToId.get(c.id) ?? '' }));

  // Ids that stopped being products because their record merged into another one.
  const liveIds = new Set(products.map((p) => p.id));
  for (const [refKey, id] of refToId) {
    const old = input.idMap.get(hashKey(refKey));
    if (old && old !== id && !liveIds.has(old)) redirects[old] = id;
  }

  products.sort((a, b) => a.id.localeCompare(b.id));
  for (const p of products) ProductSchema.parse(p);
  return {
    products,
    duplicates: { duplicate_groups: duplicateGroups, cross_source_merges: crossMerges },
    provenance,
    idMap: input.idMap,
    redirects,
    report,
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function displayName(n: Normalised): string {
  return [n.brand, n.name].filter(Boolean).join(' ');
}

function overlap(a: string[], b: string[]): boolean {
  return a.some((x) => b.includes(x));
}

function latest(dates: string[]): string {
  return [...dates].sort().pop() ?? new Date().toISOString();
}

/** Field-level precedence: records arrive sorted by source priority. */
function mergeRecords(reps: Normalised[]) {
  const first = <T>(f: (n: Normalised) => T | null | undefined): T | null => {
    for (const r of reps) {
      const v = f(r);
      if (v !== null && v !== undefined && !(Array.isArray(v) && !v.length)) return v;
    }
    return null;
  };
  const bestCls = [...reps].sort((a, b) => b.cls.confidence - a.cls.confidence)[0]!.cls;
  const specs: Record<string, string> = {};
  for (const r of [...reps].reverse()) Object.assign(specs, r.specs);
  const docs = new Map<string, ProductDocument>();
  for (const r of reps) for (const d of r.documents) if (!docs.has(d.url)) docs.set(d.url, d);
  return {
    product_line: first((r) => r.product_line),
    pack_size: first((r) => r.pack_size),
    catalogue_no: first((r) => r.catalogue_no),
    specs,
    documents: [...docs.values()],
    cls: {
      ...bestCls,
      analyte: [...new Set(reps.flatMap((r) => r.cls.analyte))],
      sample_type: [...new Set(reps.flatMap((r) => r.cls.sample_type))],
    },
  };
}

/**
 * Public spec table: filler and commercial keys dropped, keys/values translated,
 * fact-table values win over spec-list values, brand/catalogue moved to own fields.
 */
const LIST_KEYS = new Set([
  'Parameter',
  'Methode',
  'Method',
  'Probentyp',
  'Sample type',
  'Konnektivität',
]);

function publicSpecs(
  c: Candidate,
  tax: Taxonomy,
  mentionsPrivate: (s: string) => boolean,
  tr: Translator,
): Record<string, string> {
  const dropKeys = new Set(tax.spec_filters.drop_keys.map((k) => k.toLowerCase()));
  const dropVals = new Set(tax.spec_filters.drop_values.map((v) => v.toLowerCase()));
  const valueMap = new Map(Object.entries(tax.value_map).map(([k, v]) => [k.toLowerCase(), v]));
  const out: Record<string, string> = {};
  const put = (kRaw: string, vRaw: string) => {
    const k = tax.spec_key_map[kRaw] ?? kRaw.replace(/\s+/g, ' ').trim();
    if (!k || dropKeys.has(k.toLowerCase()) || dropKeys.has(kRaw.toLowerCase())) return;
    if (
      /^(brand|make|manufacturer|cat(alog(ue)?)?\.?\s*no\.?|categories|alternative name)$/i.test(k)
    )
      return;
    const isList = LIST_KEYS.has(kRaw);
    const mapped = isList
      ? tr.list(
          vRaw
            .split(/,\s*/)
            .map((x) => valueMap.get(x.toLowerCase()) ?? x)
            .join(', '),
        )
      : tr.text(valueMap.get(vRaw.toLowerCase()) ?? vRaw);
    const v = mapped.trim();
    if (!v || dropVals.has(v.toLowerCase()) || mentionsPrivate(v) || mentionsPrivate(k)) return;
    // Lists (e.g. analytes) are kept whole; free text is capped.
    out[k] = !isList && v.length > 200 ? v.slice(0, 197) + '…' : v;
  };
  for (const [k, v] of Object.entries(c.specs)) put(k, v);
  for (const [k, v] of Object.entries(c.facts)) put(k, v); // facts override specs
  return out;
}
