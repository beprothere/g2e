import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export interface ReferralNode {
  id: string;
  name: string;
  email: string;
  earnings: number;
  level: number;
  status: "active" | "inactive" | "suspicious";
  children?: ReferralNode[];
}

export async function getReferralTreeData() {
  await connectDB();

  const topUsers = await User.find({
    $or: [{ referBy: null }, { referBy: "" }, { referBy: { $exists: false } }],
  }).lean();

  const buildTree = async (
    user: any,
    currentLevel: number,
  ): Promise<ReferralNode> => {
    const commission = await Transaction.aggregate([
      { $match: { userId: user._id, type: "Commission", status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    let children: ReferralNode[] = [];
    if (currentLevel < 2 && user.referralCode) {
      let childQuery = User.find({ referBy: user.referralCode }).lean();
      if (currentLevel === 1) {
        childQuery = childQuery.limit(5);
      }

      const childUsers = await childQuery;

      if (childUsers.length > 0) {
        children = await Promise.all(
          childUsers.map((child: any) => buildTree(child, currentLevel + 1)),
        );
      }
    }

    return {
      id: user._id.toString(),
      name: user.fullName || "Unknown",
      email: user.email,
      earnings: commission[0]?.total || 0,
      level: currentLevel,
      status:
        user.status === "Blocked"
          ? "suspicious"
          : user.status === "Verified"
            ? "active"
            : "inactive",
      children: children.length > 0 ? children : undefined,
    };
  };

  const treeData = await Promise.all(topUsers.map((u) => buildTree(u, 0)));
  const totalEarnedData = await Transaction.aggregate([
    { $match: { type: "Commission", status: "Completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    treeData,
    summary: {
      totalEarned: totalEarnedData[0]?.total || 0,
      totalReferrals: await User.countDocuments({ referBy: { $ne: null } }),
      suspicious: await User.countDocuments({
        $or: [{ status: "Blocked" }, { status: "Pending" }],
      }),
    },
  };
}
