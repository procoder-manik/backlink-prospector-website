import { NextResponse } from "next/server";
import { customersCollection } from "@/lib/mongodb";
import { EMAIL_RE, cleanText, hashPassword, passwordProblem, setSession, publicCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 160).toLowerCase();
  const errors = {};
  if (!name) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  const pwIssue = passwordProblem(body.password);
  if (pwIssue) errors.password = pwIssue;
  if (Object.keys(errors).length) return NextResponse.json({ error: "Check the highlighted fields.", fields: errors }, { status: 422 });

  try {
    const col = await customersCollection();
    if (await col.findOne({ email })) {
      return NextResponse.json(
        { error: "An account with this email already exists.", fields: { email: "This email already has an account. Sign in instead." } },
        { status: 409 },
      );
    }
    const customer = {
      name, email,
      phone: cleanText(body.phone, 40),
      company: cleanText(body.company, 160),
      country: cleanText(body.country, 80),
      passwordHash: hashPassword(body.password),
      sessionVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { insertedId } = await col.insertOne(customer);
    customer._id = insertedId;
    return setSession(NextResponse.json({ ok: true, customer: publicCustomer(customer) }), customer);
  } catch (err) {
    console.error("Register failed", err);
    return NextResponse.json({ error: "Could not create the account. Try again in a minute." }, { status: 500 });
  }
}
