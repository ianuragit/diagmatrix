/** src-a adapter — implemented in Phase 2. Base URL comes from sources.local.yaml. */
import type { SourceAdapter, SourceConfig } from '../../core/types.ts';

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,
    async discover() {
      throw new Error('src-a.discover not implemented yet');
    },
    parseProduct() {
      throw new Error('src-a.parseProduct not implemented yet');
    },
  };
}
