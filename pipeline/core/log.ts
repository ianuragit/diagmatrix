/** Minimal structured logger. Also collects entries so CLI reports can summarise them. */
export type Level = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: Level;
  scope: string;
  msg: string;
  data?: Record<string, unknown>;
  at: string;
}

export interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
  child(scope: string): Logger;
  entries: LogEntry[];
}

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export function createLogger(
  scope = 'pipeline',
  opts: { level?: Level; silent?: boolean; sink?: LogEntry[] } = {},
): Logger {
  const min = ORDER[opts.level ?? (process.env.LOG_LEVEL as Level | undefined) ?? 'info'];
  const entries = opts.sink ?? [];
  const emit = (level: Level, msg: string, data?: Record<string, unknown>) => {
    const entry: LogEntry = { level, scope, msg, at: new Date().toISOString() };
    if (data) entry.data = data;
    entries.push(entry);
    if (opts.silent || ORDER[level] < min) return;
    const line = `[${level}] ${scope}: ${msg}${data ? ' ' + JSON.stringify(data) : ''}`;
    (level === 'error' || level === 'warn' ? console.error : console.log)(line);
  };
  return {
    debug: (m, d) => emit('debug', m, d),
    info: (m, d) => emit('info', m, d),
    warn: (m, d) => emit('warn', m, d),
    error: (m, d) => emit('error', m, d),
    child: (s) => createLogger(`${scope}:${s}`, { ...opts, sink: entries }),
    entries,
  };
}
