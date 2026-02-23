import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { trxId, status, userId } = await req.json();

    if (!trxId || !status || !userId) {
      return NextResponse.json(
        { success: false, error: "trxId, status and userId are required" },
        { status: 400 },
      );
    }

    const oldTrx: any = await Transaction.findById(trxId);
    if (!oldTrx) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (oldTrx.status === status) {
      return NextResponse.json(
        { success: false, error: `Already in ${status} status` },
        { status: 400 },
      );
    }

    await Transaction.findByIdAndUpdate(trxId, { status });

    if (status === "Rejected" && oldTrx.type === "Withdraw") {
      await User.findByIdAndUpdate(userId, {
        $inc: { availableWithdraw: oldTrx.amount },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Transaction marked as ${status}`,
    });
  } catch (error: any) {
    console.error("Admin panel transaction update API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 },
    );
  }
}
