import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { ordersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  try {
    const col = await ordersCollection();
    const orders = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray();
    return NextResponse.json({
      orders: orders.map(({ _id, ...o }) => ({ id: String(_id), ...o })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not reach the database. Check MONGODB_URI." }, { status: 500 });
  }
}
