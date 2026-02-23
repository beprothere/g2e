import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ status: "Blocked" });
    const pendingUsers = await User.countDocuments({ status: "Pending" });

    const ipStats = await User.aggregate([
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, _id: { $ne: null } } },
    ]);

    const duplicateIPCount = ipStats.length;
    const issues = blockedUsers + duplicateIPCount;

    let score = 100;
    if (totalUsers > 0) {
      score = Math.max(0, Math.round(100 - (issues / totalUsers) * 100));
    }

    let scoreDetail = "Excellent";
    let scoreColor = "text-green-500";

    if (score < 50) {
      scoreDetail = "Critical Risk";
      scoreColor = "text-destructive";
    } else if (score < 85) {
      scoreDetail = "Action Needed";
      scoreColor = "text-yellow-500";
    }

    return NextResponse.json({
      activeThreats: blockedUsers,
      criticalThreats: pendingUsers,
      blockedCount: blockedUsers,
      duplicateIPs: duplicateIPCount,
      securityScore: score,
      scoreDetail,
      scoreColor,
    });
  } catch (error) {
    console.error("Security stats API error:", error);
    return NextResponse.json(
      { message: "Failed to load security stats" },
      { status: 500 },
    );
  }
}
