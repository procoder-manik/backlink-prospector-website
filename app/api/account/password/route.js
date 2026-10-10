import { NextResponse } from "next/server";
import { customersCollection } from "@/lib/mongodb";
import { getCustomer, verifyPassword, hashPassword, passwordProblem, setSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!verifyPassword(body.current, customer.passwordHash)) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Check the highlighted fields.", fields: { current: "Your current password is not right." } }, { status: 422 });
  }
  const issue = passwordProblem(body.next);
  if (issue) return NextResponse.json({ error: "Check the highlighted fields.", fields: { next: issue } }, { status: 422 });

  const col = await customersCollection();
  // Bumping the version signs out every other device. This one gets a fresh cookie.
  const updated = await col.findOneAndUpdate(
    { _id: customer._id },
    { $set: { passwordHash: hashPassword(body.next), updatedAt: new Date() }, $inc: { sessionVersion: 1 } },
    { returnDocument: "after" },
  );
  return setSession(NextResponse.json({ ok: true }), updated);
}
