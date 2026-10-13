import type { ClientRateLimitInfo, Options, Store } from 'express-rate-limit';
import { prisma } from './db.js';

type Row = { hits: number; reset_at: Date };

// express-rate-limit keeps counts in memory by default. On serverless each instance has its own memory,
// so the limit would be per instance. This store keeps one shared fixed-window counter per key in Postgres.
export class PostgresStore implements Store {
  prefix: string;
  private windowSec = 60;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  init(options: Options) {
    this.windowSec = options.windowMs / 1000;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    // One atomic upsert: start a new window if the old one has expired, otherwise add a hit.
    const rows = await prisma.$queryRaw<Row[]>`
      INSERT INTO rate_limits (key, hits, reset_at)
      VALUES (${this.prefix + key}, 1, (now() AT TIME ZONE 'UTC') + make_interval(secs => ${this.windowSec}::double precision))
      ON CONFLICT (key) DO UPDATE SET
        hits = CASE WHEN rate_limits.reset_at <= (now() AT TIME ZONE 'UTC') THEN 1 ELSE rate_limits.hits + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at <= (now() AT TIME ZONE 'UTC') THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
      RETURNING hits, reset_at`;
    const row = rows[0];
    if (!row) throw new Error('Rate limit upsert returned no row');
    return { totalHits: row.hits, resetTime: row.reset_at };
  }

  async decrement(key: string) {
    await prisma.$executeRaw`UPDATE rate_limits SET hits = GREATEST(hits - 1, 0) WHERE key = ${this.prefix + key}`;
  }

  async resetKey(key: string) {
    await prisma.$executeRaw`DELETE FROM rate_limits WHERE key = ${this.prefix + key}`;
  }
}
