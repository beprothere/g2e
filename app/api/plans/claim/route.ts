import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import InvestmentPlan from "@/models/InvestmentPlan";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sendMail } from "@/app/lib/mail/sendMail";
import { planRewardClaimed } from "@/app/lib/mail/templates/transaction";

export async function POST() {
  await connectDB();

  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await User.findById(decoded.id);

  const planName = user.plan;

  if (!planName || planName === "Free") {
    return Response.json({ message: "No reward to claim" }, { status: 400 });
  }

  // Static PLANS ki jagah DB se plan fetch kiya
  const currentPlanDoc = await InvestmentPlan.findOne({ name: planName });

  if (!currentPlanDoc) {
    return Response.json({ message: "Plan details not found" }, { status: 404 });
  }

  // Reward amount ab DB wale price se aaye ga
  const rewardAmount = currentPlanDoc.price;

  user.availableWithdraw += rewardAmount;
  user.plan = "Free";
  user.planPrice = 0;
  user.commissionRate = 30; // Default commission for Free plan

  await user.save();

  await Transaction.create({
    userId: user._id,
    type: "Plan Claim",
    amount: rewardAmount,
    status: "Completed",
    from: "Plan Reward",
  });

  await sendMail(
    user.email,
    "Reward Claimed Successfully",
    planRewardClaimed(rewardAmount),
    "update",
  );

  return Response.json({ success: true });
}