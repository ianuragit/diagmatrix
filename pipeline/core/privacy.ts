/**
 * Privacy guard: source names and hosts must never reach the repo or the site.
 * Terms come from the git-ignored sources.local.yaml (private_terms + source
 * hostnames), so the guard itself never names them. Scans every file git would
 * commit (tracked + untracked-not-ignored) and, if present, the built dist/.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface PrivacyHit {
  file: string;
  line: number;
  term: string;
}

const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|gz)$/i;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

export function filesToScan(root: string): string[] {
  const listed = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: root })
    .toString()
    .split('\0')
    .filter(Boolean)
    .map((f) => join(root, f));
  const dist = join(root, 'dist');
  return [...listed, ...(existsSync(dist) ? walk(dist) : [])].filter(
    (f) => existsSync(f) && !BINARY.test(f),
  );
}

export function scanForTerms(files: string[], terms: string[], root: string): PrivacyHit[] {
  if (!terms.length) return [];
  const lowered = terms.map((t) => t.toLowerCase());
  const hits: PrivacyHit[] = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const lower = text.toLowerCase();
    if (!lowered.some((t) => lower.includes(t))) continue;
    lower.split('\n').forEach((line, i) => {
      for (const t of lowered)
        if (line.includes(t)) hits.push({ file: relative(root, file), line: i + 1, term: t });
    });
  }
  return hits;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Generic scrub for committed fixtures: source host → `<sourceId>.example`, other
 * hosts containing a private term → `img-cdn.example` (or `<sourceId>-api.example`
 * when it is a subdomain of the source), private terms → "ExampleSource", emails redacted.
 * Record-id remapping is source-specific and done by the caller.
 */
export function scrubText(
  text: string,
  opts: { terms: string[]; sourceHost: string; sourceId: string },
): string {
  const bare = opts.sourceHost.replace(/^www\./, '');
  let out = text.replace(new RegExp(`\\b([a-z0-9-]+\\.)*${esc(bare)}\\b`, 'gi'), (host) => {
    const h = host.toLowerCase().replace(/^www\./, '');
    return h === bare ? `${opts.sourceId}.example` : `${opts.sourceId}-api.example`;
  });
  out = out.replace(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|in|org|co|de|io)\b/gi, (host) =>
    opts.terms.some((t) => host.toLowerCase().includes(t)) ? 'img-cdn.example' : host,
  );
  for (const t of [...opts.terms].sort((a, b) => b.length - a.length))
    out = out.replace(new RegExp(esc(t), 'gi'), 'ExampleSource');
  return out.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, 'redacted@example.com');
}
