/**
 * Request-info modal. Any [data-request-info] element opens it, prefilled from
 * its data-* attributes. Fires a `request_info` CustomEvent (and pushes to
 * window.dataLayer if present) for analytics. Posts to Web3Forms or Formspree
 * when configured at build time; otherwise shows a copy-ready message.
 */
import { basket, basketAsText } from './basket.ts';

interface Ctx {
  context: string; // product | basket | hub | search | general
  product?: string;
  catalogue?: string;
  subject?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function messageFor(ctx: Ctx): string {
  if (ctx.context === 'basket') {
    const text = basketAsText(basket.items());
    return text
      ? `Please send pricing and availability for:\n${text}`
      : 'Please send me information about your products.';
  }
  if (ctx.product)
    return `Please send more information about ${ctx.product}${ctx.catalogue ? ` (Cat. ${ctx.catalogue})` : ''}: pricing, availability and documentation.`;
  if (ctx.subject) return `Please send information on ${ctx.subject}.`;
  if (ctx.context === 'search') return "I couldn't find a product on your site. I'm looking for: ";
  return '';
}

export function initInquiry(): void {
  const dialog = document.getElementById('inquiry') as HTMLDialogElement | null;
  if (!dialog) return;
  const form = dialog.querySelector('form')!;
  const status = dialog.querySelector<HTMLElement>('[data-status]')!;
  const fields = {
    message: form.elements.namedItem('message') as HTMLTextAreaElement,
    basket: form.elements.namedItem('basket') as HTMLInputElement,
    subject: form.elements.namedItem('subject') as HTMLInputElement,
    context: form.elements.namedItem('context') as HTMLInputElement,
  };
  const title = dialog.querySelector<HTMLElement>('[data-title]')!;
  const copyBox = dialog.querySelector<HTMLTextAreaElement>('[data-copy-text]');
  const endpoint = dialog.dataset.endpoint ?? '';
  const service = dialog.dataset.service ?? '';
  const accessKey = dialog.dataset.accessKey ?? '';
  let lastTrigger: HTMLElement | null = null;

  function open(ctx: Ctx, trigger: HTMLElement | null) {
    lastTrigger = trigger;
    status.textContent = '';
    status.className = 'status';
    form.hidden = false;
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    title.textContent = ctx.product
      ? `Request info: ${ctx.product}`
      : ctx.subject
        ? `Request info: ${ctx.subject}`
        : 'Request information';
    const msg = messageFor(ctx);
    if (!fields.message.value || fields.message.dataset.auto === '1') {
      fields.message.value = msg;
      fields.message.dataset.auto = '1';
    }
    fields.basket.value = basketAsText(basket.items());
    fields.subject.value = `Inquiry: ${ctx.product ?? ctx.subject ?? ctx.context}`;
    fields.context.value = ctx.context;
    if (copyBox) copyBox.value = msg;
    dialog!.showModal();
    (
      form.querySelector('input:not([type=hidden]):not([tabindex="-1"])') as HTMLInputElement | null
    )?.focus();
    const detail = {
      context: ctx.context,
      product: ctx.product ?? null,
      catalogue_no: ctx.catalogue ?? null,
    };
    window.dispatchEvent(new CustomEvent('request_info', { detail }));
    window.dataLayer?.push({ event: 'request_info', ...detail });
  }

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-request-info]');
    if (!t) return;
    e.preventDefault();
    open(
      {
        context: t.dataset.context ?? 'general',
        product: t.dataset.product,
        catalogue: t.dataset.catalogue,
        subject: t.dataset.subject,
      },
      t,
    );
  });
  fields.message.addEventListener('input', () => (fields.message.dataset.auto = '0'));
  dialog.addEventListener('close', () => lastTrigger?.focus());
  dialog
    .querySelectorAll('[data-close]')
    .forEach((b) => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());

  dialog.querySelector('[data-copy]')?.addEventListener('click', async () => {
    const text = [
      fields.message.value,
      fields.basket.value && fields.basket.value !== fields.message.value
        ? `\n${fields.basket.value}`
        : '',
    ].join('');
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied to clipboard.';
    } catch {
      status.textContent = 'Copy failed — select the text and copy it manually.';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'status';
    // Honeypot: real users never fill this.
    if ((form.elements.namedItem('company_website') as HTMLInputElement).value) return;
    const invalid: string[] = [];
    for (const name of ['name', 'email', 'message']) {
      const el = form.elements.namedItem(name) as HTMLInputElement;
      const ok =
        el.value.trim() !== '' &&
        (name !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', String(!ok));
      if (!ok) invalid.push(el.dataset.label ?? name);
    }
    if (invalid.length) {
      status.textContent = `Please check: ${invalid.join(', ')}.`;
      status.classList.add('error');
      (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }
    if (!endpoint) {
      status.textContent =
        'Online inquiries are not switched on yet. Use “Copy inquiry” and send it to us by email or message.';
      status.classList.add('error');
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    delete data.company_website;
    if (service === 'web3forms') data.access_key = accessKey;
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    btn.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      fields.message.dataset.auto = '1';
      status.textContent = 'Thank you — your inquiry was sent. We will reply by email.';
      status.classList.add('success');
    } catch {
      status.textContent = 'Sorry, sending failed. Please try again, or use “Copy inquiry”.';
      status.classList.add('error');
    } finally {
      btn.disabled = false;
    }
  });
}
