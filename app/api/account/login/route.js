import { NextResponse } from "next/server";
import { customersCollection } from "@/lib/mongodb";
import { cleanText, verifyPassword, setSession, publicCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = cleanText(body.email, 160).toLowerCase();
  try {
    const col = await customersCollection();
    const customer = email ? await col.findOne({ email }) : null;
    if (!customer || !verifyPassword(body.password, customer.passwordHash)) {
      await new Promise((r) => setTimeout(r, 700));
      return NextResponse.json({ error: "That email and password do not match an account." }, { status: 401 });
    }
    await col.updateOne({ _id: customer._id }, { $set: { lastLoginAt: new Date() } });
    return setSession(NextResponse.json({ ok: true, customer: publicCustomer(customer) }), customer);
  } catch (err) {
    console.error("Login failed", err);
    return NextResponse.json({ error: "Could not sign you in. Try again in a minute." }, { status: 500 });
  }
}
