import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | undefined;
let schemaReady: Promise<void> | undefined;

export function trafficDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Traffic database is not configured.");
  return (client ??= neon(url));
}

export async function ensureTrafficSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = trafficDb();
      await sql`CREATE TABLE IF NOT EXISTS traffic_pageviews (
        id BIGSERIAL PRIMARY KEY,
        viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        session_id UUID NOT NULL,
        path VARCHAR(300) NOT NULL,
        channel VARCHAR(40) NOT NULL,
        source VARCHAR(120) NOT NULL,
        campaign VARCHAR(120) NOT NULL DEFAULT ''
      )`;
      await sql`CREATE INDEX IF NOT EXISTS traffic_pageviews_viewed_at_idx ON traffic_pageviews (viewed_at)`;
      await sql`CREATE INDEX IF NOT EXISTS traffic_pageviews_session_idx ON traffic_pageviews (session_id)`;
      await sql`CREATE TABLE IF NOT EXISTS traffic_login_tokens (
        token_hash CHAR(64) PRIMARY KEY,
        ip_hash CHAR(64) NOT NULL,
        requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ
      )`;
      await sql`CREATE INDEX IF NOT EXISTS traffic_login_tokens_ip_idx ON traffic_login_tokens (ip_hash, requested_at)`;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}
