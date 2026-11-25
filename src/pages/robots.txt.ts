/**
 * robots.txt. AI crawlers are explicitly allowed (or blocked) by the
 * `allow_ai_crawlers` flag in project.config.yaml. Note: crawlers only read
 * robots.txt at a host's root, so this takes effect on a custom domain or a
 * user/org Pages site, not under a /repo/ project path.
 */
import type { APIRoute } from 'astro';
import { site } from '../lib/site';
import { abs } from '../lib/seo';

const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export const GET: APIRoute = ({ site: siteUrl }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const lines = [
    `# ${site.name}`,
    'User-agent: *',
    `Allow: ${base}`,
    `Disallow: ${base}basket/`,
    '',
    `# AI answer engines: ${site.allowAiCrawlers ? 'allowed' : 'blocked'} (project.config.yaml → allow_ai_crawlers)`,
    ...AI_BOTS.flatMap((bot) => [
      `User-agent: ${bot}`,
      site.allowAiCrawlers ? `Allow: ${base}` : 'Disallow: /',
      '',
    ]),
    `Sitemap: ${abs('/sitemap-index.xml', siteUrl)}`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
