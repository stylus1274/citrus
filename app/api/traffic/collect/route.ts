import { ensureTrafficSchema, trafficDb } from "@/lib/traffic/db";
import { sameOrigin } from "@/lib/traffic/auth";
import { attribution } from "@/lib/traffic/attribution";

export const runtime = "nodejs";

const sessionPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

function short(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return new Response(null, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 2048) return new Response(null, { status: 413 });
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const path = short(data.path, 300);
  const session = short(data.session, 36);
  if (!sessionPattern.test(session) || !path.startsWith("/") || path.startsWith("//") || path.includes("?") || /[\u0000-\u001f]/.test(path) || path.startsWith("/traffic") || path.startsWith("/api/")) {
    return new Response(null, { status: 400 });
  }
  const { channel, source, campaign } = attribution(data);
  try {
    await ensureTrafficSchema();
    const sql = trafficDb();
    await sql`INSERT INTO traffic_pageviews (session_id, path, channel, source, campaign)
      VALUES (${session}, ${path}, ${channel}, ${source}, ${campaign})`;
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Traffic collection failed", error);
    return new Response(null, { status: 503 });
  }
}
