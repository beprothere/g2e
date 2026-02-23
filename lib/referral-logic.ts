import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export async function getReferralAnalytics() {
  await connectDB();

  const incomeData = await Transaction.aggregate([
    { $match: { type: "Commission", status: "Completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const activeCount = await User.countDocuments({ status: "Verified" });

  const totalUsers = await User.countDocuments({});
  const hasReferrer = await User.countDocuments({ referBy: { $ne: null } });
  const avgDepth =
    totalUsers > 0 ? ((hasReferrer / totalUsers) * 2).toFixed(1) : "0";

  const suspiciousCount = await User.countDocuments({
    $or: [{ status: "Pending" }, { status: "Blocked" }],
  });

  return {
    totalIncome: incomeData[0]?.total || 0,
    activeReferrers: activeCount,
    avgDepth: `${avgDepth} levels`,
    suspiciousChains: suspiciousCount,
  };
}
