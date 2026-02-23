import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const [pending, todayProcessed, weekTotal, rejected] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: "Withdrawal", status: "Pending" } },
      {
        $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          type: "Withdrawal",
          status: "Completed",
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          type: "Withdrawal",
          status: { $in: ["Pending", "Completed"] },
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } },
      },
    ]),
    Transaction.aggregate([
      { $match: { type: "Withdrawal", status: "Rejected" } },
      {
        $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } },
      },
    ]),
  ]);

  return NextResponse.json({
    pending: pending[0] || { count: 0, amount: 0 },
    todayProcessed: todayProcessed[0] || { count: 0, amount: 0 },
    weekTotal: weekTotal[0] || { count: 0, amount: 0 },
    rejected: rejected[0] || { count: 0, amount: 0 },
  });
}
