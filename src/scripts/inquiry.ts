/**
 * Request-info modal. Any [data-request-info] element opens it, prefilled from
 * its data-* attributes. Fires a `request_info` CustomEvent (and pushes to
 * window.dataLayer if present) for analytics. Posts to Web3Forms or Formspree
 * when configured at build time; otherwise shows a copy-ready message.
 */
import { basket, basketAsText } from './basket.ts';
import { submitForm } from './forms.ts';

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
    const r = await submitForm(
      form,
      status,
      { endpoint, service, accessKey },
      {
        required: ['name', 'email', 'message'],
        disabledMessage:
          'Online inquiries are not switched on yet. Use “Copy inquiry” and send it to us by email or message.',
        successMessage: 'Thank you — your inquiry was sent. We will reply by email.',
        failMessage: 'Sorry, sending failed. Please try again, or use “Copy inquiry”.',
      },
    );
    if (r === 'sent') fields.message.dataset.auto = '1';
  });
}
