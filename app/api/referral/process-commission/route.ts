export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

function getLevel1Rate(balance: number) {
  if (balance >= 500) return 0.65;
  if (balance >= 200) return 0.55;
  if (balance >= 100) return 0.45;
  return 0.30;
}

export async function POST() {
  try {
    await connectDB();

    const earners = await User.find({
      latestDepositAmount: { $gt: 0 },
    });

    for (const earner of earners) {
      const depositAmount = earner.latestDepositAmount;
      if (depositAmount <= 0) continue;

      const depositKey = earner.updatedAt.getTime();

      if (!earner.referBy) continue;

      const level1User = await User.findOne({
        referralCode: earner.referBy,
      });

      if (!level1User) continue;

      const level1Rate = getLevel1Rate(level1User.depositBalance || 0);

      const level1Amount = Number(
        (depositAmount * level1Rate).toFixed(2),
      );

      const level1Key = `L1-${earner._id}-${depositKey}`;

      const level1Exists = await Transaction.findOne({
        commissionKey: level1Key,
      });

      if (!level1Exists) {
        level1User.withdrawBalance += level1Amount;
        await level1User.save();

        await Transaction.create({
          userId: level1User._id,
          type: "Level 1 Referral",
          amount: level1Amount,
          status: "Completed",
          from: earner.fullName,
          commissionKey: level1Key,
        });
      }

      if (!level1User.referBy) continue;

      const level2User = await User.findOne({
        referralCode: level1User.referBy,
      });

      if (!level2User) continue;

      const firstFive = await User.find({
        referBy: level1User.referralCode,
      })
        .sort({ createdAt: 1 })
        .limit(5);

      const eligible = firstFive.some(
        (u) => u._id.toString() === earner._id.toString(),
      );

      if (!eligible) continue;
      const level2Amount = Number(
        (level1Amount * 0.05).toFixed(2),
      );

      const level2Key = `L2-${earner._id}-${depositKey}`;

      const level2Exists = await Transaction.findOne({
        commissionKey: level2Key,
      });

      if (!level2Exists) {
        level2User.withdrawBalance += level2Amount;
        await level2User.save();

        await Transaction.create({
          userId: level2User._id,
          type: "Level 2 Referral",
          amount: level2Amount,
          status: "Completed",
          from: earner.fullName,
          commissionKey: level2Key,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PROCESS COMMISSION ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
