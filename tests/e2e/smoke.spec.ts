import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

type P = {
  id: string;
  slug: string;
  brand: string | null;
  name: string;
  duplicate_of: string | null;
  catalogue_no: string | null;
  category: string | null;
};
const products = JSON.parse(readFileSync('data/products.json', 'utf8')) as P[];
const live = products.filter((p) => !p.duplicate_of);
const sample = live.find((p) => p.catalogue_no && p.brand) ?? live[0]!;
const dup = products.find((p) => p.duplicate_of);
const display = (p: P) => [p.brand, p.name].filter(Boolean).join(' ');

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

test('home renders with one h1 and no console errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(
    page
      .getByRole('link', { name: /Browse by category/i })
      .or(page.getByRole('heading', { name: /Browse by category/i })),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('header search returns results (Pagefind)', async ({ page }) => {
  await page.goto('./');
  const q = sample.brand!.split(' ')[0]!;
  await page.locator('#site-search').fill(q);
  await expect(page.locator('#site-search-results .sr-item').first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('#site-search-results .sr-all')).toContainText('See all');
});

test('"/" focuses the header search', async ({ page }) => {
  await page.goto('./products/');
  await page.locator('body').press('/');
  await expect(page.locator('#site-search')).toBeFocused();
});

test('facet filter narrows the list and updates the URL; back restores', async ({ page }) => {
  await page.goto('./products/');
  const summary = page.locator('[data-summary]');
  await expect(page.locator('.listing.is-enhanced')).toBeVisible();
  const before = Number((await summary.textContent())!.match(/\d+/)![0]);
  const box = page.locator('input[data-dim="category"]').first();
  await box.check();
  await expect(page).toHaveURL(/category=/);
  const after = Number((await summary.textContent())!.match(/\d+/)![0]);
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThan(0);
  await page.goBack();
  await expect(page).not.toHaveURL(/category=/);
  await expect(summary).toContainText(String(before));
});

test('filter state in the URL is shareable', async ({ page }) => {
  await page.goto(`./products/?category=${sample.category}`);
  await expect(
    page.locator(`input[data-dim="category"][value="${sample.category}"]`),
  ).toBeChecked();
});

test('basket persists across reload and shows on the basket page', async ({ page }) => {
  await page.goto(`./products/${sample.slug}/`);
  await page.locator('.ctas [data-add-to-quote]').click();
  await expect(page.locator('.basket-link [data-basket-count]')).toHaveText('1');
  await page.reload();
  await expect(page.locator('.basket-link [data-basket-count]')).toHaveText('1');
  await page.goto('./basket/');
  await expect(page.locator('[data-rows] tr')).toHaveCount(1);
  await expect(page.locator('[data-rows]')).toContainText(sample.name);
});

test('request-info modal opens prefilled and validates required fields', async ({ page }) => {
  let event = false;
  await page.exposeFunction('__onRequestInfo', () => (event = true));
  await page.addInitScript(() =>
    window.addEventListener('request_info', () =>
      (window as unknown as { __onRequestInfo: () => void }).__onRequestInfo(),
    ),
  );
  await page.goto(`./products/${sample.slug}/`);
  await page.locator('.ctas [data-request-info]').click();
  const dialog = page.locator('dialog#inquiry');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-title]')).toContainText(sample.name);
  await expect(dialog.locator('textarea[name=message]')).toHaveValue(
    new RegExp(sample.catalogue_no!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  expect(event).toBe(true);
  await dialog.locator('textarea[name=message]').fill('');
  await dialog.locator('button[type=submit]').click();
  await expect(dialog.locator('input[name=name]')).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.locator('input[name=email]')).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.locator('[data-status]')).toContainText('Please check');
  await dialog.locator('input[name=email]').fill('not-an-email');
  await dialog.locator('button[type=submit]').click();
  await expect(dialog.locator('input[name=email]')).toHaveAttribute('aria-invalid', 'true');
});

test('product page: one h1, spec table with row headers, key facts', async ({ page }) => {
  await page.goto(`./products/${sample.slug}/`);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(display(sample));
  await expect(page.locator('.facts dl')).toBeVisible();
  if (await page.locator('.specs').count())
    await expect(page.locator('.specs th[scope=row]').first()).toBeVisible();
});

test('duplicate listing redirects to its canonical product', async ({ page }) => {
  test.skip(!dup, 'no duplicates in data');
  await page.goto(`./products/${dup!.slug}/`);
  await expect(page).toHaveURL(new RegExp(`/products/${dup!.duplicate_of}/$`));
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('listing is a plain paginated static page', async ({ page }) => {
    await page.goto('./products/');
    await expect(page.locator('[data-results] .pcard')).toHaveCount(24);
    await page.locator('[data-static-pager] a[rel=next]').click();
    await expect(page).toHaveURL(/\/products\/2\/$/);
    await expect(page.locator('[data-results] .pcard').first()).toBeVisible();
  });
});

test('@mobile sticky CTA bar on product pages', async ({ page }) => {
  await page.goto(`./products/${sample.slug}/`);
  await expect(page.locator('.sticky-cta')).toBeVisible();
  await page.locator('.sticky-cta [data-request-info]').click();
  await expect(page.locator('dialog#inquiry')).toBeVisible();
});

test('request-a-product page: prefilled from search, validates, offers copy fallback', async ({
  page,
}) => {
  await page.goto('./request-product/?q=Widget%20analyser&type=Consumable');
  await expect(page.locator('h1')).toHaveText('Request a product');
  const form = page.locator('#product-request');
  await expect(form.locator('input[name=product_name]')).toHaveValue('Widget analyser');
  await expect(form.locator('input[name=product_type][value="Consumable"]')).toBeChecked();
  await form.locator('button[type=submit]').click();
  await expect(form.locator('input[name=name]')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('input[name=email]')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('input[name=product_name]')).toHaveAttribute('aria-invalid', 'false');
  await form.locator('input[name=name]').fill('A Tester');
  await form.locator('input[name=email]').fill('a@example.com');
  await form.locator('button[type=submit]').click();
  await expect(form.locator('[data-status]')).toContainText(
    /not switched on|received your request/,
  );
});

test('empty filter results link to the request-a-product page', async ({ page }) => {
  await page.goto('./products/?q=zzzz-no-such-product');
  const link = page.locator('[data-results] a[href*="request-product"]');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /q=zzzz-no-such-product/);
});
