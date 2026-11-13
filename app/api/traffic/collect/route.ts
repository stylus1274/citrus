import { ensureTrafficSchema, trafficDb } from "@/lib/traffic/db";
import { sameOrigin } from "@/lib/traffic/auth";

export const runtime = "nodejs";

const sessionPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

function short(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function attribution(data: Record<string, unknown>) {
  const source = short(data.source, 120).toLowerCase().replace(/[^a-z0-9. _-]/g, "") || "direct";
  const medium = short(data.medium, 40).toLowerCase();
  const referrer = short(data.referrer, 120).toLowerCase().replace(/[^a-z0-9.-]/g, "");
  const candidate = source === "direct" ? referrer : source;
  const paid = /^(cpc|ppc|paid|paidsearch|paid_search|display|cpm)$/.test(medium) || Boolean(data.gclid || data.msclkid);
  const search = /(^|\.)(google|bing|yahoo|duckduckgo|ecosia)\./.test(candidate) || /^(google|bing|yahoo|duckduckgo)$/.test(candidate);
  const social = /(^|\.)(facebook|instagram|linkedin|tiktok|pinterest|reddit|x|twitter)\./.test(candidate) || /^(facebook|instagram|linkedin|tiktok|pinterest|reddit|x|twitter)$/.test(candidate);
  const channel = paid ? "Paid" : medium === "email" ? "Email" : medium === "organic" || (!medium && search) ? "Organic search"
    : medium === "social" || (!medium && social) ? "Social" : source !== "direct" || referrer ? "Referral" : "Direct";
  return { channel, source: data.gclid && source === "direct" ? "google" : data.msclkid && source === "direct" ? "bing" : candidate || "direct", campaign: short(data.campaign, 120) };
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
