/**
 * Pagefind-powered search. The index is built after `astro build`
 * (`pagefind --site dist`), so it is loaded lazily on first use.
 */
interface PFResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta: Record<string, string>;
    excerpt: string;
    filters: Record<string, string[]>;
  }>;
}
interface PF {
  options: (o: Record<string, unknown>) => Promise<void>;
  search: (
    q: string,
    o?: { filters?: Record<string, string[]> },
  ) => Promise<{ results: PFResult[]; filters?: Record<string, Record<string, number>> }>;
  filters: () => Promise<Record<string, Record<string, number>>>;
}

const base = (document.documentElement.dataset.base ?? '/').replace(/\/?$/, '/');
let pfPromise: Promise<PF | null> | null = null;

export function loadPagefind(): Promise<PF | null> {
  if (!pfPromise) {
    const src = `${base}pagefind/pagefind.js`;
    pfPromise = import(/* @vite-ignore */ src)
      .then(async (m: PF) => {
        await m.options({ baseUrl: base, excerptLength: 18 });
        return m;
      })
      .catch(() => null);
  }
  return pfPromise;
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
/** Pagefind excerpts contain only <mark>; keep those, escape everything else. */
const safeExcerpt = (s: string) =>
  escapeHtml(s)
    .replace(/&lt;mark&gt;/g, '<mark>')
    .replace(/&lt;\/mark&gt;/g, '</mark>');

export function renderResult(d: Awaited<ReturnType<PFResult['data']>>): string {
  const title = escapeHtml(d.meta.title ?? d.url);
  const brand = d.meta.brand ? `<span class="sr-brand">${escapeHtml(d.meta.brand)}</span>` : '';
  const cat = d.meta.catalogue_no
    ? `<span class="sr-cat">Cat. ${escapeHtml(d.meta.catalogue_no)}</span>`
    : '';
  return `<a class="sr-item" href="${escapeHtml(d.url)}"><span class="sr-title">${title}</span><span class="sr-meta">${brand}${cat}</span><span class="sr-excerpt">${safeExcerpt(d.excerpt)}</span></a>`;
}

export function initHeaderSearch(): void {
  const form = document.getElementById('site-search-form') as HTMLFormElement | null;
  const input = document.getElementById('site-search') as HTMLInputElement | null;
  const panel = document.getElementById('site-search-results');
  if (!form || !input || !panel) return;
  let seq = 0;

  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (
      e.key === '/' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !/input|textarea|select/i.test(t.tagName) &&
      !t.isContentEditable
    ) {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      panel.hidden = true;
      input.blur();
    }
  });
  input.addEventListener('focus', () => void loadPagefind());
  input.addEventListener('input', async () => {
    const q = input.value.trim();
    const mine = ++seq;
    if (q.length < 2) {
      panel.hidden = true;
      return;
    }
    const pf = await loadPagefind();
    if (mine !== seq) return;
    if (!pf) {
      panel.innerHTML = '<p class="sr-empty">Search is available on the published site.</p>';
      panel.hidden = false;
      return;
    }
    const res = await pf.search(q);
    const top = await Promise.all(res.results.slice(0, 6).map((r) => r.data()));
    if (mine !== seq) return;
    const all = `<a class="sr-all" href="${base}search/?q=${encodeURIComponent(q)}">See all ${res.results.length} results</a>`;
    panel.innerHTML = top.length
      ? top.map(renderResult).join('') + all
      : `<div class="sr-empty"><p>No products match “${escapeHtml(q)}”.</p><a class="btn btn-sm" href="${base}request-product/?q=${encodeURIComponent(q)}">Can't find it? Ask us</a></div>`;
    panel.hidden = false;
  });
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target as Node)) panel.hidden = true;
  });
}
