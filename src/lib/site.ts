/** Build-time project settings for the site (from project.config.yaml). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { ProjectConfigSchema, isUnset } from '../../pipeline/core/config.ts';

const cfg = ProjectConfigSchema.parse(
  parse(readFileSync(join(process.cwd(), 'project.config.yaml'), 'utf8')),
);

const service = cfg.form.service.toLowerCase();
const formReady =
  !isUnset(cfg.form.service) &&
  !isUnset(cfg.form.key) &&
  ['web3forms', 'formspree'].includes(service);

export const site = {
  name: cfg.site_name,
  /** Display name: "diagmatrix" → "DiagMatrix" style is left to the user; we use the configured string. */
  repo: cfg.github_repo,
  whatsapp: isUnset(cfg.whatsapp_number) ? null : cfg.whatsapp_number.replace(/\D/g, ''),
  email: isUnset(cfg.contact_email) ? null : cfg.contact_email,
  allowAiCrawlers: cfg.allow_ai_crawlers,
  form: formReady
    ? {
        service: service as 'web3forms' | 'formspree',
        endpoint: service === 'web3forms' ? 'https://api.web3forms.com/submit' : cfg.form.key,
        accessKey: service === 'web3forms' ? cfg.form.key : null,
      }
    : null,
};

export const DISCLAIMER =
  'For professional and in-vitro diagnostic use only. Product information is compiled from manufacturer and distributor listings and may be incomplete or out of date — verify specifications with the manufacturer before purchase. Not medical advice.';
