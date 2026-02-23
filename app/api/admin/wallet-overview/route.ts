import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function GET() {
  await connectDB();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Total Deposits calculation (including adjustments)
  const deposits = await Transaction.aggregate([
    {
      $match: {
        status: "Completed",
        type: { $in: ["Deposit", "Plan Purchase", "Adjustment - Deposit", "Adjustment - Commission"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Total Withdrawals calculation
  const withdrawals = await Transaction.aggregate([
    {
      $match: {
        status: "Completed",
        type: { $in: ["Withdrawal", "Adjustment - Withdrawal"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Manual Adjustments Stats for Today
  const manual = await Transaction.aggregate([
  { $match: { type: { $regex: "^Adjustment -" } } },
  {
    $group: {
      _id: null,
      count: { $sum: 1 },
      plus: { $sum: { $cond: [{ $eq: ["$type", "Adjustment - Deposit"] }, "$amount", 0] } },
      commission: { $sum: { $cond: [{ $eq: ["$type", "Adjustment - Commission"] }, "$amount", 0] } },
      minus: { $sum: { $cond: [{ $eq: ["$type", "Adjustment - Withdrawal"] }, "$amount", 0] } },
    },
  },
]);

  return NextResponse.json({
    deposits: deposits[0]?.total || 0,
    withdrawals: withdrawals[0]?.total || 0,
    lockedWallets: await User.countDocuments({ accountstatus: "Deactivated" }),
    activeWallets: await User.countDocuments({ accountstatus: "Activated" }),
    manual: manual[0] || { count: 0, plus: 0, minus: 0 },
  });
}
