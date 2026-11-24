/** saaskin adapter — implemented in Phase 2. */
import type { SourceAdapter, SourceConfig } from '../../core/types.ts';

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,
    async discover() {
      throw new Error('saaskin.discover not implemented yet');
    },
    parseProduct() {
      throw new Error('saaskin.parseProduct not implemented yet');
    },
  };
}
