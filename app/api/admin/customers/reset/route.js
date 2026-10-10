import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { customersCollection } from "@/lib/mongodb";
import { cleanText, hashPassword, temporaryPassword } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

// Admin sets a temporary password for a customer who forgot theirs.
export async function POST(request) {
  if (!isAdmin()) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const email = cleanText(body.email, 160).toLowerCase();
  const col = await customersCollection();
  const customer = email ? await col.findOne({ email }) : null;
  if (!customer) return NextResponse.json({ error: "This customer has no account yet." }, { status: 404 });

  const password = temporaryPassword();
  await col.updateOne(
    { _id: customer._id },
    { $set: { passwordHash: hashPassword(password), updatedAt: new Date(), claimFails: 0 }, $inc: { sessionVersion: 1 } },
  );
  return NextResponse.json({ ok: true, password });
}
