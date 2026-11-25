/**
 * Quote basket (localStorage key `quote_basket_v1`). No server, no prices.
 * Any element with [data-add-to-quote] (and data-id/name/brand/catalogue) adds
 * an item; [data-basket-count] shows the count. Emits `basket:change`.
 */
export interface BasketItem {
  id: string;
  name: string;
  brand: string;
  catalogue_no: string;
  qty: number;
  note: string;
}

const KEY = 'quote_basket_v1';

function safeRead(): BasketItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is BasketItem =>
          !!x && typeof x === 'object' && typeof (x as BasketItem).id === 'string',
      )
      .map((x) => ({
        id: String(x.id),
        name: String(x.name ?? ''),
        brand: String(x.brand ?? ''),
        catalogue_no: String(x.catalogue_no ?? ''),
        qty: Math.max(1, Math.min(9999, Math.floor(Number(x.qty) || 1))),
        note: String(x.note ?? '').slice(0, 500),
      }));
  } catch {
    return [];
  }
}

function write(items: BasketItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable (private mode) — basket lives for this page only */
  }
  window.dispatchEvent(new CustomEvent('basket:change', { detail: items }));
}

export const basket = {
  items: safeRead,
  count: () => safeRead().reduce((n, i) => n + i.qty, 0),
  has: (id: string) => safeRead().some((i) => i.id === id),
  add(item: Omit<BasketItem, 'qty' | 'note'> & Partial<Pick<BasketItem, 'qty' | 'note'>>) {
    const items = safeRead();
    const existing = items.find((i) => i.id === item.id);
    if (existing) existing.qty = Math.min(9999, existing.qty + (item.qty ?? 1));
    else items.push({ qty: 1, note: '', ...item });
    write(items);
  },
  update(id: string, patch: Partial<Pick<BasketItem, 'qty' | 'note'>>) {
    write(
      safeRead().map((i) =>
        i.id === id
          ? { ...i, ...patch, qty: Math.max(1, Math.min(9999, Math.floor(patch.qty ?? i.qty))) }
          : i,
      ),
    );
  },
  remove(id: string) {
    write(safeRead().filter((i) => i.id !== id));
  },
  clear() {
    write([]);
  },
};

export function basketAsText(items: BasketItem[]): string {
  if (!items.length) return '';
  return items
    .map(
      (i, n) =>
        `${n + 1}. ${[i.brand, i.name].filter(Boolean).join(' ')}${i.catalogue_no ? ` (Cat. ${i.catalogue_no})` : ''} × ${i.qty}${i.note ? ` — ${i.note}` : ''}`,
    )
    .join('\n');
}

export function basketAsCsv(items: BasketItem[]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    // Guard against CSV formula injection in spreadsheet apps.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [
    'id,brand,name,catalogue_no,qty,note',
    ...items.map((i) => [i.id, i.brand, i.name, i.catalogue_no, i.qty, i.note].map(esc).join(',')),
  ].join('\n');
}

function refreshUi(): void {
  const n = basket.count();
  document.querySelectorAll<HTMLElement>('[data-basket-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-add-to-quote]').forEach((btn) => {
    const inBasket = basket.has(btn.dataset.id ?? '');
    btn.setAttribute('aria-pressed', String(inBasket));
    const label = btn.querySelector('[data-label]');
    if (label) label.textContent = inBasket ? 'In quote ✓' : 'Add to quote';
  });
}

export function initBasket(): void {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add-to-quote]');
    if (!btn) return;
    e.preventDefault();
    const d = btn.dataset;
    if (basket.has(d.id ?? '')) {
      window.location.href = btn.dataset.basketUrl ?? '/basket/';
      return;
    }
    basket.add({
      id: d.id ?? '',
      name: d.name ?? '',
      brand: d.brand ?? '',
      catalogue_no: d.catalogue ?? '',
    });
    const live = document.getElementById('basket-live');
    if (live) live.textContent = `${d.name ?? 'Item'} added to your quote basket.`;
  });
  window.addEventListener('basket:change', refreshUi);
  window.addEventListener('storage', (e) => e.key === KEY && refreshUi());
  refreshUi();
}
