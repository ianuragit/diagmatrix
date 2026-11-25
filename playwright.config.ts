import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// Serve the built site under the same base path GitHub Pages will use.
const cfg = parse(readFileSync('project.config.yaml', 'utf8')) as {
  site_url: string;
  github_repo: string;
};
const siteUrl = /\{\{/.test(cfg.site_url)
  ? `https://x.github.io/${cfg.github_repo.split('/')[1]}`
  : cfg.site_url;
const base = new URL(siteUrl).pathname.replace(/\/?$/, '/');
const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${base}`,
    trace: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `pnpm exec astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
