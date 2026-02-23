import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { txnEmitter } from "@/lib/txnEmitter";

type Params = {
  id: string;
};

export async function PATCH(
  req: Request,
  context: { params: Promise<Params> },
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const { action } = await req.json();

    const txn = await Transaction.findById(id);
    if (!txn) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (txn.status !== "Pending") {
      return NextResponse.json(
        { error: "Transaction already processed" },
        { status: 400 },
      );
    }

    const user = await User.findById(txn.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amount = Number(txn.amount);
    const type = txn.type.toLowerCase();

    if (action === "approve") {
      if (type === "deposit") {
        user.depositBalance += amount;
        user.pendingDeposit -= amount;
        user.status = "Verified";
        user.isPaid = true;
      }

      if (type === "withdrawal") {
        user.pendingWithdraw -= amount;
      }

      txn.status = "Completed";
    }

    if (action === "reject") {
      if (type === "withdrawal") {
        user.availableWithdraw += amount;
        user.pendingWithdraw -= amount;
      }

      if (type === "deposit") {
        user.pendingDeposit -= amount;
      }

      txn.status = "Rejected";
    }

    await user.save();
    await txn.save();

    txnEmitter.emit("new-transaction", {
      _id: txn._id,
      userId: txn.userId,
      type: txn.type,
      amount: txn.amount,
      status: txn.status,
      createdAt: txn.createdAt,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transaction PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}
