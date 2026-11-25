import { describe, expect, it } from 'vitest';
import { isAllowed, parseRobots, groupFor } from './robots.ts';

const UA = 'DiagMatrixBot/0.1 (contact: a@b.co)';

describe('robots', () => {
  it('applies longest match with Allow winning ties', () => {
    const r = parseRobots(
      `User-agent: *\nDisallow: /private\nAllow: /private/ok\nDisallow: /*.pdf$\n`,
    );
    expect(isAllowed(r, UA, '/public')).toBe(true);
    expect(isAllowed(r, UA, '/private/x')).toBe(false);
    expect(isAllowed(r, UA, '/private/ok/1')).toBe(true);
    expect(isAllowed(r, UA, '/a/b.pdf')).toBe(false);
    expect(isAllowed(r, UA, '/a/b.pdf?x=1')).toBe(true);
  });

  it('prefers a specific UA group over *', () => {
    const r = parseRobots(
      `User-agent: *\nDisallow: /\n\nUser-agent: diagmatrixbot\nDisallow: /cart\nCrawl-delay: 3\n`,
    );
    expect(isAllowed(r, UA, '/products')).toBe(true);
    expect(isAllowed(r, UA, '/cart')).toBe(false);
    expect(groupFor(r, UA)?.crawlDelay).toBe(3);
    expect(isAllowed(r, 'OtherBot', '/products')).toBe(false);
  });

  it('conservatively applies Disallow lines from other groups', () => {
    const r = parseRobots(
      `User-agent: *\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: AdsBot\nAllow: /\nDisallow: /inquiry.html\n`,
    );
    expect(isAllowed(r, UA, '/inquiry.html')).toBe(false);
    expect(isAllowed(r, UA, '/product-1.html')).toBe(true);
    expect(isAllowed(r, UA, '/inquiry.html', { conservative: false })).toBe(true);
  });

  it('does not borrow a blanket ban aimed at other bots, nor borrow when * has its own list', () => {
    const r = parseRobots(
      `User-agent: BadBot\nUser-agent: OtherBot\nDisallow: /\nDisallow: /de/\n\nUser-agent: *\nDisallow: /login\n`,
    );
    expect(isAllowed(r, UA, '/')).toBe(true);
    expect(isAllowed(r, UA, '/products/x')).toBe(true);
    expect(isAllowed(r, UA, '/de/products')).toBe(true);
    expect(isAllowed(r, UA, '/login')).toBe(false);
    expect(isAllowed(r, 'BadBot/1.0', '/products/x')).toBe(false);
  });

  it('treats empty Disallow and empty file as allow-all, collects sitemaps', () => {
    const r = parseRobots(`User-agent: *\nDisallow:\nSitemap: https://x.test/sitemap.xml`);
    expect(isAllowed(r, UA, '/anything')).toBe(true);
    expect(r.sitemaps).toEqual(['https://x.test/sitemap.xml']);
    expect(isAllowed(parseRobots(''), UA, '/')).toBe(true);
  });
});
