import { NextResponse } from "next/server";
import { customersCollection, ordersCollection } from "@/lib/mongodb";
import { getCustomer, publicCustomer, publicOrder, cleanText } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ customer: null }, { status: 401 });
  try {
    const col = await ordersCollection();
    const orders = await col.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ customer: publicCustomer(customer), orders: orders.map(publicOrder) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load your orders. Try again in a minute." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const update = { updatedAt: new Date() };
  if (body.name !== undefined) {
    const name = cleanText(body.name, 120);
    if (!name) return NextResponse.json({ error: "Check the highlighted fields.", fields: { name: "Enter your name." } }, { status: 422 });
    update.name = name;
  }
  if (body.phone !== undefined) update.phone = cleanText(body.phone, 40);
  if (body.company !== undefined) update.company = cleanText(body.company, 160);
  if (body.country !== undefined) update.country = cleanText(body.country, 80);

  const col = await customersCollection();
  const result = await col.findOneAndUpdate({ _id: customer._id }, { $set: update }, { returnDocument: "after" });
  return NextResponse.json({ customer: publicCustomer(result) });
}
