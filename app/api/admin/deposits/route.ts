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
    Transaction.find({ type: "Deposit" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email address")
      .lean(),
    Transaction.countDocuments({ type: "Deposit" }),
  ]);

  const data = rows.map((tx: any) => ({
    _id: tx._id.toString(),
    user: tx.userId?.fullName || "Unknown",
    email: tx.userId?.email || "N/A",
    address: tx.userId?.address || "N/A",
    amount: tx.amount,
    status: tx.status, 
    ip: tx.ip,              
    from: tx.from || "",
    createdAt: tx.createdAt,          
  }));

  return NextResponse.json({
    data,
    total,
  });
}
