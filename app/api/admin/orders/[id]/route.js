import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isAdmin } from "@/lib/admin-auth";
import { ordersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "paid", "licensed", "cancelled"];

export async function PATCH(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Unknown order." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const update = { updatedAt: new Date() };
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    update.status = body.status;
  }
  for (const key of ["licenseKey", "adminNotes", "machineId"]) {
    if (body[key] !== undefined) update[key] = String(body[key]).trim().slice(0, 4000);
  }

  const col = await ordersCollection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(params.id) },
    { $set: update },
    { returnDocument: "after" },
  );
  if (!result) return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  const { _id, ...rest } = result;
  return NextResponse.json({ order: { id: String(_id), ...rest } });
}

export async function DELETE(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  const col = await ordersCollection();
  await col.deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}
