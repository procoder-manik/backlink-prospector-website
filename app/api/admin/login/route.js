import { NextResponse } from "next/server";
import { ADMIN_COOKIE, passwordMatches, sessionValue } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set on the server." }, { status: 500 });
  }
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "That password is incorrect." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
