/**
 * Minimal decoder for Nuxt's `__NUXT_DATA__` payload (devalue "flattened" JSON):
 * a JSON array whose element 0 is the root and whose object/array members are
 * indices into that same array. Special forms are ["Reactive", i], ["ShallowRef", i],
 * ["Set", ...], ["Map", k, v, ...], ["Date", iso], ["null"] etc.
 */
const HOLE = -2;
const UNDEF = -1;
const NAN = -3;
const POS_INF = -4;
const NEG_INF = -5;
const NEG_ZERO = -6;

const WRAPPERS = new Set([
  'Reactive',
  'ShallowReactive',
  'Ref',
  'ShallowRef',
  'EmptyRef',
  'EmptyShallowRef',
  'NuxtError',
  'Object',
]);

export function unflatten(input: string | unknown[]): unknown {
  const values = typeof input === 'string' ? (JSON.parse(input) as unknown[]) : input;
  if (!Array.isArray(values)) return values;
  const hydrated = new Array<unknown>(values.length);
  const done = new Array<boolean>(values.length).fill(false);

  function hydrate(index: number): unknown {
    if (index === UNDEF || index === HOLE) return undefined;
    if (index === NAN) return NaN;
    if (index === POS_INF) return Infinity;
    if (index === NEG_INF) return -Infinity;
    if (index === NEG_ZERO) return -0;
    if (done[index]) return hydrated[index];
    const value = values[index];
    if (value === null || typeof value !== 'object') {
      done[index] = true;
      return (hydrated[index] = value);
    }
    if (Array.isArray(value)) {
      if (
        typeof value[0] === 'string' &&
        value.length >= 1 &&
        (WRAPPERS.has(value[0]) || /^[A-Z]/.test(value[0]))
      ) {
        const tag = value[0];
        done[index] = true;
        if (WRAPPERS.has(tag))
          return (hydrated[index] = value.length > 1 ? hydrate(value[1] as number) : undefined);
        if (tag === 'Date') return (hydrated[index] = String(value[1]));
        if (tag === 'Set')
          return (hydrated[index] = value.slice(1).map((i) => hydrate(i as number)));
        if (tag === 'Map') {
          const m: Record<string, unknown> = {};
          for (let i = 1; i < value.length; i += 2)
            m[String(hydrate(value[i] as number))] = hydrate(value[i + 1] as number);
          return (hydrated[index] = m);
        }
        if (tag === 'BigInt') return (hydrated[index] = String(value[1]));
        if (tag === 'RegExp') return (hydrated[index] = String(value[1]));
        if (tag === 'null') {
          const o: Record<string, unknown> = {};
          for (let i = 1; i < value.length; i += 2)
            o[String(value[i])] = hydrate(value[i + 1] as number);
          return (hydrated[index] = o);
        }
        // Unknown tag: treat as a plain array of indices.
      }
      const arr: unknown[] = [];
      hydrated[index] = arr;
      done[index] = true;
      for (const i of value) arr.push(typeof i === 'number' ? hydrate(i) : i);
      return arr;
    }
    const obj: Record<string, unknown> = {};
    hydrated[index] = obj;
    done[index] = true;
    for (const [k, i] of Object.entries(value as Record<string, number>))
      obj[k] = typeof i === 'number' ? hydrate(i) : i;
    return obj;
  }
  return hydrate(0);
}

/** Inverse of `unflatten` for plain JSON data (used to build compact test fixtures). */
export function flatten(value: unknown): string {
  const out: unknown[] = [];
  const seen = new Map<unknown, number>();
  const visit = (v: unknown): number => {
    if (v === undefined) return UNDEF;
    if (v !== null && typeof v === 'object') {
      if (seen.has(v)) return seen.get(v)!;
      const idx = out.length;
      seen.set(v, idx);
      out.push(null);
      if (Array.isArray(v)) out[idx] = v.map(visit);
      else out[idx] = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, visit(x)]));
      return idx;
    }
    const idx = out.length;
    out.push(v);
    return idx;
  };
  visit(value);
  return JSON.stringify(out);
}
