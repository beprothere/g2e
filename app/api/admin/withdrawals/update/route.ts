import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendPush } from "@/lib/notifier";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { id, action } = await req.json();
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "id and action are required" },
        { status: 400 },
      );
    }

    if (!["approve", "reject", "hold"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }

    const withdrawal: any = await Transaction.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const userId = withdrawal.userId;
    const amount = Number(withdrawal.amount || 0);
    let newStatus = "Pending";

    if (action === "approve") {
      newStatus = "Completed";
      sendPush(
        userId,
        "Withdrawal Approved",
        `Your withdrawal of $${amount} has been approved.`,
        "/wallet",
      ).catch((e: any) => console.error("Notification Error:", e));
      await User.findByIdAndUpdate(userId, {
        $inc: { pendingWithdraw: -amount },
      });
    } else if (action === "reject") {
      newStatus = "Rejected";
      sendPush(
        userId,
        "Withdrawal Rejected",
        `Your withdrawal of $${amount} has been rejected.`,
        "/wallet",
      ).catch((e: any) => console.error("Notification Error:", e));
      await User.findByIdAndUpdate(userId, {
        $inc: {
          availableWithdraw: amount,
          pendingWithdraw: -amount,
        },
      });
    } else if (action === "hold") {
      newStatus = "Pending";
      sendPush(
        userId,
        "Withdrawal Put on Hold",
        `Your withdrawal of $${amount} has been put on hold.`,
        "/wallet",
      ).catch((e: any) => console.error("Notification Error:", e));
    }

    await Transaction.findByIdAndUpdate(id, {
      status: newStatus,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: e.message || "Update failed" },
      { status: 500 },
    );
  }
}
