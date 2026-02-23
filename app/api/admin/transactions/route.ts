import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const type = searchParams.get("type");
  const userId = searchParams.get("userId");

  const query: any = {};
  if (type && type !== "all") query.type = type;
  if (userId) query.userId = userId;

  const total = await Transaction.countDocuments(query);

  const transactions = await Transaction.find(query)
    .populate("userId", "fullName availableWithdraw depositBalance pendingDeposit pendingWithdraw")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({
    data: transactions,
    total,
    page,
    limit,
  });
}

export async function POST(req: Request) {
  await connectDB();

  const { amount, type } = await req.json();

  const normalizedType = type === "Withdrawal" ? "Withdrawal" : "Deposit";
  const finalAmount =
    normalizedType === "Withdrawal"
      ? -Math.abs(Number(amount || 0))
      : Math.abs(Number(amount || 0));

  if (!Number.isFinite(finalAmount) || finalAmount === 0) {
    return NextResponse.json(
      { success: false, message: "Invalid amount" },
      { status: 400 },
    );
  }

  await Transaction.create({
    userId: new mongoose.Types.ObjectId("000000000000000000000000"),
    amount: finalAmount,
    type: `Adjustment - ${normalizedType}`,
    status: "Completed",
    description: `Admin Manual ${normalizedType}`,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
