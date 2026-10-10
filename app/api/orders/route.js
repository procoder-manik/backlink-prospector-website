import { NextResponse } from "next/server";
import crypto from "crypto";
import { ordersCollection, customersCollection } from "@/lib/mongodb";
import { getCustomer, hashPassword, verifyPassword, passwordProblem, setSession } from "@/lib/customer-auth";
import { findPlan, formatPrice } from "@/lib/plans";
import { findPayment } from "@/lib/site";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MID_RE = /^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/;

function clean(value, max = 200) {
  return String(value ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
}

function orderNumber() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `BP-${ymd}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the form as JSON." }, { status: 400 });
  }

  // Bots fill every field, people never see this one.
  if (clean(body.website)) {
    return NextResponse.json({ ok: true, orderNumber: "BP-OK" });
  }

  const plan = findPlan(clean(body.plan, 20));
  const payment = findPayment(clean(body.paymentMethod, 20));
  const currency = body.currency === "BDT" ? "BDT" : "USD";
  const signedIn = await getCustomer();
  const name = clean(body.name, 120) || signedIn?.name || "";
  // A signed-in customer always orders under their account email.
  const email = signedIn ? signedIn.email : clean(body.email, 160).toLowerCase();
  const machineId = clean(body.machineId, 19).toUpperCase();

  const errors = {};
  if (!plan) errors.plan = "Choose a plan.";
  if (!name) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (plan && plan.usd > 0 && !payment) errors.paymentMethod = "Choose how you want to pay.";
  if (machineId && !MID_RE.test(machineId)) errors.machineId = "Machine ID looks like 7F3A-91C2-04BD-E85A. Leave it empty if you do not have it yet.";
  if (!signedIn) {
    const issue = passwordProblem(body.password);
    if (issue) errors.password = issue;
  }
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: errors }, { status: 422 });
  }

  // Every order belongs to an account. New customers get one from the details on this form.
  let customer = signedIn;
  let createdAccount = false;
  try {
    if (!customer) {
      const customers = await customersCollection();
      const existing = await customers.findOne({ email });
      if (existing) {
        if (!verifyPassword(body.password, existing.passwordHash)) {
          await new Promise((r) => setTimeout(r, 700));
          return NextResponse.json({
            error: "This email already has an account. Enter that account's password, or sign in first.",
            fields: { password: "This is not the password for the account with this email." },
            accountExists: true,
          }, { status: 422 });
        }
        customer = existing;
      } else {
        customer = {
          name, email,
          phone: clean(body.phone, 40),
          company: clean(body.company, 160),
          country: clean(body.country, 80),
          passwordHash: hashPassword(body.password),
          sessionVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const { insertedId } = await customers.insertOne(customer);
        customer._id = insertedId;
        createdAccount = true;
      }
    }
  } catch (err) {
    console.error("Account step failed", err);
    return NextResponse.json({ error: "We could not save your order. Try again in a minute, or email us." }, { status: 500 });
  }

  const order = {
    orderNumber: orderNumber(),
    customerId: customer._id,
    status: "new",
    plan: plan.id,
    planName: plan.name,
    currency,
    price: formatPrice(plan, currency),
    amount: currency === "BDT" ? plan.bdt : plan.usd,
    name,
    email,
    company: clean(body.company, 160),
    country: clean(body.country, 80),
    phone: clean(body.phone, 40),
    machineId,
    paymentMethod: plan.usd > 0 ? payment.id : "none",
    transactionId: clean(body.transactionId, 80),
    notes: clean(body.notes, 2000),
    licenseKey: "",
    adminNotes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const col = await ordersCollection();
    await col.insertOne(order);
  } catch (err) {
    console.error("Order insert failed", err);
    return NextResponse.json(
      { error: "We could not save your order. Try again in a minute, or email us." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true, orderNumber: order.orderNumber, createdAccount });
  return signedIn ? res : setSession(res, customer);
}
