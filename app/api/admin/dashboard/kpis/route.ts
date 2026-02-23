export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

function calculateTrend(current: number, previous: number) {
  if (previous === 0) {
    return { value: 100, isPositive: true };
  }

  const diff = ((current - previous) / previous) * 100;

  return {
    value: Math.abs(Math.round(diff)),
    isPositive: diff >= 0,
  };
}

export async function GET() {
  try {
    await connectDB();
    const totalUsers = await User.countDocuments();

    const previousTotalUsers = await User.countDocuments({
      createdAt: {
        $lt: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    });

    const totalUsersTrend = calculateTrend(
      totalUsers,
      previousTotalUsers
    );

    const activeUsers = await User.countDocuments({
      status: "Verified",
    });

    const previousActiveUsers = await User.countDocuments({
      status: "Verified",
      createdAt: {
        $lt: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    });

    const activeUsersTrend = calculateTrend(
      activeUsers,
      previousActiveUsers
    );

    const revenueAgg = await Transaction.aggregate([
      {
        $match: {
          type: "Deposit",
          status: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const previousRevenueAgg = await Transaction.aggregate([
      {
        $match: {
          type: "Deposit",
          status: "Completed",
          createdAt: {
            $lt: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const previousRevenue = previousRevenueAgg[0]?.total || 0;

    const revenueTrend = calculateTrend(
      totalRevenue,
      previousRevenue
    );

    const pendingWithdrawAgg = await Transaction.aggregate([
      {
        $match: {
          type: "Withdrawal",
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const pendingWithdrawAmount =
      pendingWithdrawAgg[0]?.total || 0;
    const pendingWithdrawUsersAgg = await Transaction.aggregate([
      {
        $match: {
          type: "Withdrawal",
          status: "Pending",
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
      {
        $count: "totalUsers",
      },
    ]);

    const pendingWithdrawUsers =
      pendingWithdrawUsersAgg[0]?.totalUsers || 0;

    return NextResponse.json({
      totalUsers,
      totalUsersTrend,

      activeUsers,
      activeUsersTrend,

      totalRevenue,
      revenueTrend,

      pendingWithdrawAmount,
      pendingWithdrawUsers,
    });
  } catch (error) {
    console.error("Dashboard KPI Error:", error);
    return NextResponse.json(
      { message: "Failed to load dashboard KPIs" },
      { status: 500 }
    );
  }
}
