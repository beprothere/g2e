import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { applyReferralCommission } from "@/lib/referralCommission";
import { NextResponse } from "next/server";

export async function POST() {
  await connectDB();

  const user: any = await User.findOneAndUpdate(
    { email: "hasaanad12min@gmail.com" },
    { $set: { latestDepositAmount: 20 } },
    { new: true }
  );

  await applyReferralCommission(user._id.toString());

  return NextResponse.json({
    success: true,
    user,
  });
}
