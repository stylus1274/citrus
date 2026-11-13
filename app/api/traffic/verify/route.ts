import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { newSession, SESSION_COOKIE } from "@/lib/traffic/auth";
import { ensureTrafficSchema, trafficDb } from "@/lib/traffic/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const destination = new URL("/traffic/", url.origin);
  if (!/^[a-zA-Z0-9_-]{43}$/.test(token)) {
    destination.searchParams.set("error", "invalid");
    return NextResponse.redirect(destination, { headers: { "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" } });
  }
  try {
    await ensureTrafficSchema();
    const sql = trafficDb();
    const hash = createHash("sha256").update(token).digest("hex");
    const used = await sql`UPDATE traffic_login_tokens SET used_at = now()
      WHERE token_hash = ${hash} AND used_at IS NULL AND expires_at > now()
      RETURNING token_hash`;
    if (!used.length) {
      destination.searchParams.set("error", "expired");
      return NextResponse.redirect(destination, { headers: { "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" } });
    }
    const response = NextResponse.redirect(destination, { headers: { "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, newSession(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Traffic verification failed", error);
    destination.searchParams.set("error", "unavailable");
    return NextResponse.redirect(destination, { headers: { "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" } });
  }
}
