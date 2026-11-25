/**
 * Faceted listing island. Progressive enhancement over a static paginated list:
 * reads /data/facets.json, filters client-side (OR within a facet, AND across
 * facets), shows counts, sorts, paginates, and keeps state in the URL query
 * (shareable, back/forward safe). Without JS the static pages remain.
 */
type Dim = 'brand' | 'category' | 'technology' | 'analyte' | 'sample' | 'type';
interface FacetData {
  dims: Record<Dim, { key: string; label: string }[]>;
  /** [slug, brand, name, brandIdx, catIdx, techIdx, analyteIdx[], sampleIdx[], typeIdx, catalogue, pack] */
  items: [
    string,
    string,
    string,
    number,
    number,
    number,
    number[],
    number[],
    number,
    string,
    string,
  ][];
}

const DIMS: { dim: Dim; label: string }[] = [
  { dim: 'category', label: 'Category' },
  { dim: 'type', label: 'Product type' },
  { dim: 'brand', label: 'Brand' },
  { dim: 'technology', label: 'Technology' },
  { dim: 'analyte', label: 'Analyte' },
  { dim: 'sample', label: 'Sample type' },
];
const PAGE = 24;
const base = (document.documentElement.dataset.base ?? '/').replace(/\/?$/, '/');
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

interface State {
  sel: Record<Dim, Set<string>>;
  sort: 'name' | 'brand';
  page: number;
  q: string;
}

function readState(locked: Partial<Record<Dim, string[]>>): State {
  const p = new URLSearchParams(location.search);
  const sel = Object.fromEntries(
    DIMS.map(({ dim }) => [dim, new Set((p.get(dim) ?? '').split(',').filter(Boolean))]),
  ) as Record<Dim, Set<string>>;
  for (const [d, v] of Object.entries(locked)) for (const x of v ?? []) sel[d as Dim].add(x);
  return {
    sel,
    sort: p.get('sort') === 'brand' ? 'brand' : 'name',
    page: Math.max(1, Number(p.get('page')) || 1),
    q: p.get('q') ?? '',
  };
}

function writeState(s: State, locked: Partial<Record<Dim, string[]>>, push: boolean): void {
  const p = new URLSearchParams();
  for (const { dim } of DIMS) {
    const vals = [...s.sel[dim]].filter((v) => !(locked[dim] ?? []).includes(v));
    if (vals.length) p.set(dim, vals.join(','));
  }
  if (s.q) p.set('q', s.q);
  if (s.sort !== 'name') p.set('sort', s.sort);
  if (s.page > 1) p.set('page', String(s.page));
  const qs = p.toString();
  const url = `${location.pathname.replace(/\/\d+\/$/, '/')}${qs ? `?${qs}` : ''}`;
  history[push ? 'pushState' : 'replaceState']({ facets: true }, '', url);
}

export async function initFacets(root: HTMLElement): Promise<void> {
  const locked = JSON.parse(root.dataset.locked ?? '{}') as Partial<Record<Dim, string[]>>;
  const results = root.querySelector<HTMLElement>('[data-results]')!;
  const pager = root.querySelector<HTMLElement>('[data-pager]');
  const panel = root.querySelector<HTMLElement>('[data-facet-panel]')!;
  const summary = root.querySelector<HTMLElement>('[data-summary]')!;
  let data: FacetData;
  try {
    const res = await fetch(`${base}data/facets.json`);
    if (!res.ok) throw new Error(String(res.status));
    data = (await res.json()) as FacetData;
  } catch {
    return; // keep the static list
  }
  root.classList.add('is-enhanced');
  let state = readState(locked);
  // Static pages are /products/2/ etc. — fold that into state on first load.
  const pathPage = /\/(\d+)\/$/.exec(location.pathname);
  if (pathPage && !new URLSearchParams(location.search).has('page'))
    state.page = Number(pathPage[1]);

  const idx: Record<Dim, Map<string, number>> = Object.fromEntries(
    DIMS.map(({ dim }) => [dim, new Map(data.dims[dim].map((d, i) => [d.key, i]))]),
  ) as Record<Dim, Map<string, number>>;
  const valuesOf = (it: FacetData['items'][number], dim: Dim): number[] => {
    switch (dim) {
      case 'brand':
        return [it[3]];
      case 'category':
        return [it[4]];
      case 'technology':
        return it[5] >= 0 ? [it[5]] : [];
      case 'analyte':
        return it[6];
      case 'sample':
        return it[7];
      case 'type':
        return it[8] >= 0 ? [it[8]] : [];
    }
  };
  const matches = (it: FacetData['items'][number], except?: Dim) => {
    if (state.q) {
      const hay = `${it[1]} ${it[2]} ${it[9]}`.toLowerCase();
      if (
        !state.q
          .toLowerCase()
          .split(/\s+/)
          .every((w) => hay.includes(w))
      )
        return false;
    }
    return DIMS.every(({ dim }) => {
      if (dim === except || !state.sel[dim].size) return true;
      const want = [...state.sel[dim]]
        .map((k) => idx[dim].get(k))
        .filter((x): x is number => x !== undefined);
      return valuesOf(it, dim).some((v) => want.includes(v));
    });
  };

  function card(it: FacetData['items'][number]): string {
    const [slug, brand, name, , c, , a, , ty, catNo, pack] = it;
    const href = `${base}products/${slug}/`;
    const analytes = a
      .slice(0, 3)
      .map((i) => `<span class="chip">${esc(data.dims.analyte[i]!.label)}</span>`)
      .join('');
    const display = [brand, name].filter(Boolean).join(' ');
    return `<article class="card pcard">
      <div class="pcard-body">
        <p class="pcard-kicker">${esc(data.dims.category[c]!.label)}${ty >= 0 ? ` · ${esc(data.dims.type[ty]!.label)}` : ''}</p>
        <h3 class="pcard-title"><a href="${href}">${brand ? `<span class="pcard-brand">${esc(brand)}</span> ` : ''}${esc(name)}</a></h3>
        <div class="pcard-chips">${analytes}</div>
        <p class="pcard-facts muted">${[catNo && `Cat. ${esc(catNo)}`, pack && esc(pack)].filter(Boolean).join(' · ')}</p>
      </div>
      <div class="pcard-actions">
        <button type="button" class="btn btn-sm" data-request-info data-context="product" data-product="${esc(display)}" data-catalogue="${esc(catNo)}">Request info</button>
        <button type="button" class="btn btn-sm btn-teal" data-add-to-quote data-id="${esc(slug)}" data-name="${esc(name)}" data-brand="${esc(brand)}" data-catalogue="${esc(catNo)}" data-basket-url="${base}basket/" aria-pressed="false"><span data-label>Add to quote</span></button>
      </div>
    </article>`;
  }

  function renderPanel() {
    const html = DIMS.filter(({ dim }) => !locked[dim]?.length)
      .map(({ dim, label }) => {
        const counts = new Map<number, number>();
        for (const it of data.items)
          if (matches(it, dim))
            for (const v of valuesOf(it, dim)) counts.set(v, (counts.get(v) ?? 0) + 1);
        const opts = data.dims[dim]
          .map((d, i) => ({ ...d, n: counts.get(i) ?? 0 }))
          .filter((d) => d.n > 0 || state.sel[dim].has(d.key))
          .sort((x, y) => y.n - x.n || x.label.localeCompare(y.label));
        if (!opts.length) return '';
        const many = opts.length > 8;
        const items = opts
          .map(
            (o, i) =>
              `<li${many && i >= 8 && !state.sel[dim].has(o.key) ? ' data-more hidden' : ''}><label><input type="checkbox" data-dim="${dim}" value="${esc(o.key)}"${state.sel[dim].has(o.key) ? ' checked' : ''}> <span>${esc(o.label)}</span> <span class="count">${o.n}</span></label></li>`,
          )
          .join('');
        const open = state.sel[dim].size > 0 || dim === 'category' || dim === 'type';
        return `<details class="facet"${open ? ' open' : ''}><summary>${label}${state.sel[dim].size ? ` <span class="count">(${state.sel[dim].size})</span>` : ''}</summary><ul>${items}</ul>${many ? `<button type="button" class="linkish" data-show-more>Show all ${opts.length}</button>` : ''}</details>`;
      })
      .join('');
    const anySel =
      DIMS.some(({ dim }) => [...state.sel[dim]].some((v) => !(locked[dim] ?? []).includes(v))) ||
      state.q;
    panel.innerHTML = `<div class="facet-head"><label class="facet-q"><span class="visually-hidden">Filter by name</span><input type="search" placeholder="Filter by name or Cat. no." value="${esc(state.q)}" data-q></label>${anySel ? '<button type="button" class="linkish" data-clear>Clear all</button>' : ''}</div>${html}`;
  }

  function render(push = false) {
    const list = data.items.filter((it) => matches(it));
    list.sort((a, b) =>
      state.sort === 'brand'
        ? a[1].localeCompare(b[1]) || a[2].localeCompare(b[2])
        : `${a[1]} ${a[2]}`.localeCompare(`${b[1]} ${b[2]}`),
    );
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    state.page = Math.min(state.page, pages);
    const slice = list.slice((state.page - 1) * PAGE, state.page * PAGE);
    results.innerHTML = slice.length
      ? slice.map(card).join('')
      : `<div class="empty card"><p>No products match these filters.</p><button type="button" class="btn" data-request-info data-context="search">Can't find it? Ask us</button></div>`;
    summary.textContent = `${list.length} product${list.length === 1 ? '' : 's'}${pages > 1 ? ` · page ${state.page} of ${pages}` : ''}`;
    if (pager) {
      const btn = (p: number, label: string, cur = false) =>
        `<button type="button" class="btn btn-sm${cur ? ' btn-teal' : ''}" data-page="${p}"${cur ? ' aria-current="page"' : ''}>${label}</button>`;
      const nums: number[] = [];
      for (let p = 1; p <= pages; p++)
        if (p === 1 || p === pages || Math.abs(p - state.page) <= 2) nums.push(p);
      pager.innerHTML =
        pages > 1
          ? `${state.page > 1 ? btn(state.page - 1, '‹ Prev') : ''}${nums.map((p, i) => `${i && p - nums[i - 1]! > 1 ? '<span>…</span>' : ''}${btn(p, String(p), p === state.page)}`).join('')}${state.page < pages ? btn(state.page + 1, 'Next ›') : ''}`
          : '';
    }
    renderPanel();
    writeState(state, locked, push);
    window.dispatchEvent(new CustomEvent('basket:change'));
  }

  panel.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (!t.dataset.dim) return;
    const set = state.sel[t.dataset.dim as Dim];
    t.checked ? set.add(t.value) : set.delete(t.value);
    state.page = 1;
    render(true);
    panel
      .querySelector<HTMLInputElement>(
        `input[data-dim="${t.dataset.dim}"][value="${CSS.escape(t.value)}"]`,
      )
      ?.focus();
  });
  let qTimer: number | undefined;
  panel.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (!('q' in t.dataset)) return;
    window.clearTimeout(qTimer);
    qTimer = window.setTimeout(() => {
      state.q = t.value.trim();
      state.page = 1;
      render(false);
      const q = panel.querySelector<HTMLInputElement>('[data-q]');
      q?.focus();
      q?.setSelectionRange(q.value.length, q.value.length);
    }, 200);
  });
  panel.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if ('clear' in t.dataset) {
      state = readState(locked);
      for (const { dim } of DIMS) state.sel[dim] = new Set(locked[dim] ?? []);
      state.q = '';
      state.page = 1;
      render(true);
    }
    if ('showMore' in t.dataset) {
      t.closest('details')
        ?.querySelectorAll<HTMLElement>('[data-more]')
        .forEach((li) => (li.hidden = false));
      t.remove();
    }
  });
  root.querySelector('[data-sort]')?.addEventListener('change', (e) => {
    state.sort = (e.target as HTMLSelectElement).value === 'brand' ? 'brand' : 'name';
    render(true);
  });
  pager?.addEventListener('click', (e) => {
    const p = (e.target as HTMLElement).closest<HTMLElement>('[data-page]');
    if (!p) return;
    state.page = Number(p.dataset.page);
    render(true);
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  window.addEventListener('popstate', () => {
    state = readState(locked);
    render(false);
  });
  const sortSel = root.querySelector<HTMLSelectElement>('[data-sort]');
  if (sortSel) sortSel.value = state.sort;
  render(false);
}
