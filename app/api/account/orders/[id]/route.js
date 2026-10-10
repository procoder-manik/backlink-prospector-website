import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { ordersCollection } from "@/lib/mongodb";
import { getCustomer, cleanText, publicOrder } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

const MID_RE = /^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/;

// Customers can send their Machine ID and payment transaction ID from My account.
export async function PATCH(request, { params }) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Unknown order." }, { status: 404 });

  const col = await ordersCollection();
  const order = await col.findOne({ _id: new ObjectId(params.id), customerId: customer._id });
  if (!order) return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  if (order.status === "cancelled") return NextResponse.json({ error: "This order is cancelled." }, { status: 409 });

  const body = await request.json().catch(() => ({}));
  const update = { updatedAt: new Date(), customerUpdatedAt: new Date() };

  if (body.machineId !== undefined) {
    if (order.status === "licensed") {
      return NextResponse.json({ error: "Your key is already issued. Message us to move it to another computer." }, { status: 409 });
    }
    const machineId = cleanText(body.machineId, 19).toUpperCase();
    if (machineId && !MID_RE.test(machineId)) {
      return NextResponse.json({ error: "Check the highlighted fields.", fields: { machineId: "Machine ID looks like 7F3A-91C2-04BD-E85A." } }, { status: 422 });
    }
    update.machineId = machineId;
  }
  if (body.transactionId !== undefined) {
    if (["paid", "licensed"].includes(order.status)) {
      return NextResponse.json({ error: "Payment is already confirmed for this order." }, { status: 409 });
    }
    update.transactionId = cleanText(body.transactionId, 80);
  }

  const updated = await col.findOneAndUpdate({ _id: order._id }, { $set: update }, { returnDocument: "after" });
  return NextResponse.json({ order: publicOrder(updated) });
}
