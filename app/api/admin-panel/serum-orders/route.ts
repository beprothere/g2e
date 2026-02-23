import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SerumOrder from "@/models/SerumOrder";
import { sendPush } from "@/lib/notifier";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { orders: [], error: "userId missing" },
        { status: 400 },
      );
    }

    const orders = await SerumOrder.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("SERUM ORDERS ERROR:", err);
    return NextResponse.json(
      { orders: [], error: err.message },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { orderId, status, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const order = await SerumOrder.findByIdAndUpdate(
      orderId,
      { status, trackingNumber },
      { new: true },
    );

    sendPush(
      order.userId,
      `Your Serum order has been ${status}! ✨`,
      `Congratulations! Your ${order.serumName} serum has been updated to status: ${status}.`,
      "/serum-orders",
    ).catch((e) => console.error(e));

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
