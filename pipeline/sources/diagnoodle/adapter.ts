/** diagnoodle adapter — implemented in Phase 3. */
import type { SourceAdapter, SourceConfig } from '../../core/types.ts';

export default function createAdapter(cfg: SourceConfig): SourceAdapter {
  return {
    id: cfg.id,
    baseUrl: cfg.baseUrl,
    async discover() {
      throw new Error('diagnoodle.discover not implemented yet');
    },
    parseProduct() {
      throw new Error('diagnoodle.parseProduct not implemented yet');
    },
  };
}
