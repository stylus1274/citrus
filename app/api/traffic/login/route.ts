import { createHash, createHmac, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { ADMIN_EMAIL, sameOrigin } from "@/lib/traffic/auth";
import { ensureTrafficSchema, trafficDb } from "@/lib/traffic/db";

export const runtime = "nodejs";

function reply(message: string, status = 200) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply("Invalid request.", 403);
  let email = "";
  try {
    const payload = await request.json();
    email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 200) : "";
  } catch {
    return reply("Invalid request.", 400);
  }

  const generic = "If this address has access, a sign-in link is on its way.";
  if (email !== ADMIN_EMAIL.toLowerCase()) return reply(generic);

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const secret = process.env.TRAFFIC_AUTH_SECRET;
    if (!apiKey || !secret || secret.length < 32) throw new Error("Traffic login is not configured.");
    await ensureTrafficSchema();
    const sql = trafficDb();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHmac("sha256", secret).update(ip).digest("hex");
    const attempts = await sql`SELECT count(*)::int AS total FROM traffic_login_tokens
      WHERE ip_hash = ${ipHash} AND requested_at > now() - interval '1 hour'`;
    if (Number(attempts[0]?.total || 0) >= 5) return reply("Too many requests. Try again in an hour.", 429);

    const token = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(token).digest("hex");
    await sql`INSERT INTO traffic_login_tokens (token_hash, ip_hash, expires_at)
      VALUES (${hash}, ${ipHash}, now() + interval '15 minutes')`;
    const url = new URL("/api/traffic/verify/", request.url);
    url.searchParams.set("token", token);
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Citrus Website <estimates@citrusdemolitionandlandclearing.com>",
      to: ADMIN_EMAIL,
      subject: "Sign in to Citrus traffic dashboard",
      text: `Use this one-time link to sign in. It expires in 15 minutes:\n\n${url.toString()}\n\nIf you didn't request it, you can ignore this email.`,
    });
    if (error) throw new Error(error.message);
    return reply(generic);
  } catch (error) {
    console.error("Traffic login failed", error);
    return reply("The sign-in link could not be sent. Try again shortly.", 503);
  }
}
