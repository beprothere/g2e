import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PlanTransaction from "@/models/PlanTransaction";
import { investmentStatsEmitter } from "@/lib/investmentStatsEmitter";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const inProgressStats = await PlanTransaction.aggregate([
      { $match: { planStatus: "In Progress" } },
      {
        $group: {
          _id: null,
          totalInvestors: { $addToSet: "$userId" },
          totalInvestedAmount: { $sum: "$paidAmount" },
          avgCommissionRate: { $avg: "$planCommission" },
        },
      },
      {
        $project: {
          _id: 0,
          investorsCount: { $size: "$totalInvestors" },
          totalInvestedAmount: 1,
          avgCommissionRate: { $round: ["$avgCommissionRate", 2] },
          avgInvestmentAmount: {
            $cond: [
              { $eq: [{ $size: "$totalInvestors" }, 0] },
              0,
              {
                $divide: ["$totalInvestedAmount", { $size: "$totalInvestors" }],
              },
            ],
          },
        },
      },
    ]);

    const inProgress = inProgressStats[0] || {
      investorsCount: 0,
      totalInvestedAmount: 0,
      avgCommissionRate: 0,
      avgInvestmentAmount: 0,
    };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [currentMonth, lastMonth] = await Promise.all([
      PlanTransaction.aggregate([
        {
          $match: {
            planStatus: "In Progress",
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      PlanTransaction.aggregate([
        {
          $match: {
            planStatus: "In Progress",
            createdAt: {
              $gte: lastMonthStart,
              $lt: startOfMonth,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
    ]);

    const currentTotal = currentMonth[0]?.total || 0;
    const lastTotal = lastMonth[0]?.total || 0;

    const mtdGrowth =
      lastTotal === 0 ? 0 : ((currentTotal - lastTotal) / lastTotal) * 100;

    const pendingStats = await PlanTransaction.aggregate([
      { $match: { planStatus: "Pending" } },
      {
        $group: {
          _id: null,
          pendingCount: { $sum: 1 },
          pendingAmount: { $sum: "$paidAmount" },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const pending = pendingStats[0] || {
      pendingCount: 0,
      pendingAmount: 0,
    };

    const latestStats = {
      investorsCount: inProgress.investorsCount,
      avgInvestmentAmount: inProgress.avgInvestmentAmount,
      avgCommissionRate: inProgress.avgCommissionRate,
      totalInvestedAmount: inProgress.totalInvestedAmount,
      mtdGrowth: Number(mtdGrowth.toFixed(2)),
      pendingCount: pending.pendingCount,
      pendingAmount: pending.pendingAmount,
    };

    investmentStatsEmitter.emit("stats-update", latestStats);

    return NextResponse.json({
      success: true,
      data: latestStats,
    });
  } catch (error) {
    console.error("Investment stats error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
