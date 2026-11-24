/** Dev helper: fetch URL(s) through the polite cached client and print cache paths. */
import { join } from 'node:path';
import { HttpClient, buildUserAgent } from '../pipeline/core/http.ts';
import { ROOT, loadProjectConfig } from '../pipeline/core/config.ts';
import { createLogger } from '../pipeline/core/log.ts';

const http = new HttpClient({
  userAgent: buildUserAgent(loadProjectConfig().contact_email),
  cacheDir: join(ROOT, '.cache', 'http'),
  log: createLogger('fetch'),
});
for (const url of process.argv.slice(2)) {
  const r = await http.get(url);
  console.log(r.status, r.fromCache ? 'cache' : 'net', r.body.length, http.cachePaths(url).body);
}
console.log(http.stats);
