import { NextResponse } from "next/server";
import { clearSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  return clearSession(NextResponse.json({ ok: true }));
}
