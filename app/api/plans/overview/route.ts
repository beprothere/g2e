import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import InvestmentPlan from "@/models/InvestmentPlan";
import jwt from "jsonwebtoken";
import { getAuthToken } from "@/lib/getAuthToken";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const token = getAuthToken(req.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const user: any = await User.findById(decoded.id)
      .select("plan fullName planPrice commissionRate referralCode planStatus depositBalance availableWithdraw")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const [verifiedReferrals, activePlans] = await Promise.all([
      User.countDocuments({
        referBy: user.referralCode,
        status: "Verified",
      }),
      InvestmentPlan.find({ status: "active" })
        .sort({ price: 1 })
        .select("name price refsRequired commission descriptions")
        .lean(),
    ]);

    const plans = activePlans.map((plan: any) => ({
      id: plan._id?.toString(),
      name: plan.name,
      price: plan.price,
      refsRequired: plan.refsRequired,
      commission: plan.commission,
      descriptions: plan.descriptions,
    }));

    const userData = {
      plan: user.plan,
      fullName: user.fullName,
      planPrice: user.planPrice,
      planStatus: user.planStatus,
      commissionRate: user.commissionRate,
      level1Count: verifiedReferrals,
      depositBalance: user.depositBalance,
      availableWithdraw: user.availableWithdraw,
    };

    return NextResponse.json({
      userData,
      plans,
      plan: userData.plan,
      planPrice: userData.planPrice,
      commissionRate: userData.commissionRate,
      level1Count: userData.level1Count,
      depositBalance: userData.depositBalance,
      availableWithdraw: userData.availableWithdraw,
    });
  } catch (error) {
    console.error("PLANS OVERVIEW API ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
