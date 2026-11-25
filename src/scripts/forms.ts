/**
 * Shared form handling for the inquiry modal and the request-a-product page:
 * honeypot, required-field + email validation with aria-invalid, and posting
 * to Web3Forms / Formspree (configured at build time via data-* attributes).
 */
export interface FormTarget {
  endpoint: string;
  service: string;
  accessKey: string;
}

export function targetFrom(el: HTMLElement): FormTarget {
  return {
    endpoint: el.dataset.endpoint ?? '',
    service: el.dataset.service ?? '',
    accessKey: el.dataset.accessKey ?? '',
  };
}

/** Returns labels of invalid fields (and marks them); empty array = valid. */
export function validate(form: HTMLFormElement, required: string[]): string[] {
  const invalid: string[] = [];
  for (const name of required) {
    const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) continue;
    const v = el.value.trim();
    const ok = v !== '' && (name !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
    el.setAttribute('aria-invalid', String(!ok));
    if (!ok) invalid.push(el.dataset.label ?? name);
  }
  return invalid;
}

export type SendResult = 'sent' | 'spam' | 'invalid' | 'disabled' | 'failed';

export async function submitForm(
  form: HTMLFormElement,
  status: HTMLElement,
  target: FormTarget,
  opts: {
    required: string[];
    disabledMessage: string;
    successMessage: string;
    failMessage: string;
  },
): Promise<SendResult> {
  status.className = 'status';
  const hp = form.elements.namedItem('company_website') as HTMLInputElement | null;
  if (hp?.value) return 'spam'; // honeypot: real users never fill this
  const invalid = validate(form, opts.required);
  if (invalid.length) {
    status.textContent = `Please check: ${invalid.join(', ')}.`;
    status.classList.add('error');
    (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
    return 'invalid';
  }
  if (!target.endpoint) {
    status.textContent = opts.disabledMessage;
    status.classList.add('error');
    return 'disabled';
  }
  const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
  delete data.company_website;
  if (target.service === 'web3forms') data.access_key = target.accessKey;
  const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');
  if (btn) btn.disabled = true;
  status.textContent = 'Sending…';
  try {
    const res = await fetch(target.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    status.textContent = opts.successMessage;
    status.classList.add('success');
    return 'sent';
  } catch {
    status.textContent = opts.failMessage;
    status.classList.add('error');
    return 'failed';
  } finally {
    if (btn) btn.disabled = false;
  }
}
