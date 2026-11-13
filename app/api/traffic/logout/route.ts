import { NextResponse } from "next/server";
import { sameOrigin, SESSION_COOKIE } from "@/lib/traffic/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
