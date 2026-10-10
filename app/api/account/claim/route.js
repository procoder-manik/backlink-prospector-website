import { NextResponse } from "next/server";
import { customersCollection, ordersCollection } from "@/lib/mongodb";
import { getCustomer, cleanText, publicOrder } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

const MAX_FAILS = 10;

// Adds an order placed before accounts existed. The order must use this account's email.
export async function POST(request) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  if ((customer.claimFails || 0) >= MAX_FAILS) {
    return NextResponse.json({ error: "Too many tries. Message us with your order number and we will add it for you." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const orderNumber = cleanText(body.orderNumber, 20).toUpperCase();

  const orders = await ordersCollection();
  const order = orderNumber ? await orders.findOne({ orderNumber, email: customer.email }) : null;
  if (!order || (order.customerId && String(order.customerId) !== String(customer._id))) {
    const customers = await customersCollection();
    await customers.updateOne({ _id: customer._id }, { $inc: { claimFails: 1 } });
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: `No order ${orderNumber} was placed with ${customer.email}. Check the number in your confirmation.` }, { status: 404 });
  }
  const updated = await orders.findOneAndUpdate(
    { _id: order._id },
    { $set: { customerId: customer._id, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return NextResponse.json({ order: publicOrder(updated) });
}
