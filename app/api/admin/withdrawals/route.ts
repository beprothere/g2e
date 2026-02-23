import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import { connectDB } from "@/lib/db";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = 5;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Transaction.find({ type: "Withdrawal" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName")
      .lean(),
    Transaction.countDocuments({ type: "Withdrawal" }),
  ]);

  const data = rows.map((tx: any) => ({
    _id: tx._id.toString(),
    user: tx.userId?.fullName || "Unknown",
    amount: tx.amount,
    ip: tx.ip,
    from: tx.from || "",
    status: tx.status, 
    createdAt: tx.createdAt,
  }));

  return NextResponse.json({ data, total });
}
