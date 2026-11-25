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

/**
 * conservative (default): when no group names our bot specifically (we fall
 * under `*`) AND that group has no Disallow lines of its own, also honour the
 * Disallow lines of other groups — some files put a shared list under the last
 * named bot. A blanket "Disallow: /" in another group is a targeted ban of that
 * bot, not a shared list, so it is never borrowed.
 */
export function isAllowed(
  robots: Robots,
  userAgent: string,
  pathWithQuery: string,
  opts: { conservative?: boolean } = {},
): boolean {
  const group = groupFor(robots, userAgent);
  const specific = !!group && !group.agents.includes('*');
  const ownDisallows = (group?.rules ?? []).some((r) => !r.allow);
  const conservative = (opts.conservative ?? true) && !specific && !ownDisallows;
  const rules = [
    ...(group?.rules ?? []),
    ...(conservative
      ? robots.groups
          .filter((g) => g !== group)
          .flatMap((g) => g.rules.filter((r) => !r.allow && r.pattern !== '/'))
      : []),
  ];
  let decision: RobotsRule | null = null;
  for (const rule of rules) {
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
