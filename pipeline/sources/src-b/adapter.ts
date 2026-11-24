/** src-b adapter — implemented in Phase 3. Base URL comes from sources.local.yaml. */
import type { SourceAdapter, SourceConfig } from '../../core/types.ts';

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,
    async discover() {
      throw new Error('src-b.discover not implemented yet');
    },
    parseProduct() {
      throw new Error('src-b.parseProduct not implemented yet');
    },
  };
}
