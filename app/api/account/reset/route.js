import { NextResponse } from "next/server";
import { customersCollection } from "@/lib/mongodb";
import {
  cleanText, hashToken, hashPassword, passwordProblem, setSession, publicCustomer,
} from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const token = cleanText(body.token, 200);

  const issue = passwordProblem(body.password);
  if (issue) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: { password: issue } }, { status: 422 });
  }
  if (!token) {
    return NextResponse.json({ error: "This reset link is not valid. Request a new one." }, { status: 400 });
  }

  try {
    const col = await customersCollection();
    // One atomic step: the link works only if it matches, is not expired, and is cleared when used.
    const updated = await col.findOneAndUpdate(
      { resetHash: hashToken(token), resetExpires: { $gt: new Date() } },
      {
        $set: { passwordHash: hashPassword(body.password), updatedAt: new Date(), claimFails: 0 },
        $unset: { resetHash: "", resetExpires: "" },
        $inc: { sessionVersion: 1 },
      },
      { returnDocument: "after" },
    );
    if (!updated) {
      return NextResponse.json(
        { error: "This reset link has expired or was already used. Request a new one." },
        { status: 410 },
      );
    }
    return setSession(NextResponse.json({ ok: true, customer: publicCustomer(updated) }), updated);
  } catch (err) {
    console.error("Reset password failed", err);
    return NextResponse.json({ error: "Could not reset the password. Try again in a minute." }, { status: 500 });
  }
}