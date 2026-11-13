import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_EMAIL = process.env.TRAFFIC_ADMIN_EMAIL || "charlieb@velvetinkmedia.com";
export const SESSION_COOKIE = "citrus_traffic_admin";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

function signingSecret() {
  const secret = process.env.TRAFFIC_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Traffic login secret is not configured.");
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

export function newSession() {
  const payload = Buffer.from(JSON.stringify({ email: ADMIN_EMAIL, exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export async function hasTrafficAccess() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra) return false;
  try {
    const expected = Buffer.from(signature(payload));
    const actual = Buffer.from(supplied);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.email === ADMIN_EMAIL && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
