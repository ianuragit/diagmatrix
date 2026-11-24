/**
 * Small robots.txt parser (RFC 9309): user-agent groups, Allow/Disallow with
 * longest-match precedence (Allow wins ties), `*` and `$` wildcards, Crawl-delay.
 */
export interface RobotsRule {
  allow: boolean;
  pattern: string;
}

export interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
  crawlDelay: number | null;
}

export interface Robots {
  groups: RobotsGroup[];
  sitemaps: string[];
}

export function parseRobots(text: string): Robots {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [], crawlDelay: null };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === 'sitemap') {
      sitemaps.push(value);
    } else if (current && (key === 'allow' || key === 'disallow')) {
      // An empty Disallow means "allow everything" — no rule needed.
      if (value) current.rules.push({ allow: key === 'allow', pattern: value });
    } else if (current && key === 'crawl-delay') {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) current.crawlDelay = n;
    }
  }
  return { groups, sitemaps };
}

/** Pick the group for our UA token: most specific product-token match, else `*`. */
export function groupFor(robots: Robots, userAgent: string): RobotsGroup | null {
  const ua = userAgent.toLowerCase();
  let best: RobotsGroup | null = null;
  let bestLen = -1;
  for (const g of robots.groups) {
    for (const a of g.agents) {
      if (a !== '*' && ua.includes(a) && a.length > bestLen) {
        best = g;
        bestLen = a.length;
      }
    }
  }
  if (best) return best;
  return robots.groups.find((g) => g.agents.includes('*')) ?? null;
}

function patternToRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith('$');
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp('^' + body + (anchored ? '$' : ''));
}

export function isAllowed(robots: Robots, userAgent: string, pathWithQuery: string): boolean {
  const group = groupFor(robots, userAgent);
  if (!group) return true;
  let decision: RobotsRule | null = null;
  for (const rule of group.rules) {
    if (!patternToRegex(rule.pattern).test(pathWithQuery)) continue;
    if (
      !decision ||
      rule.pattern.length > decision.pattern.length ||
      (rule.pattern.length === decision.pattern.length && rule.allow)
    ) {
      decision = rule;
    }
  }
  return decision ? decision.allow : true;
}
