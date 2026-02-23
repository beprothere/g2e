export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { Reward } from "@/models/Reward";
import ClaimedReward from "@/models/ClaimedReward";
import Notification from "@/models/Notifications";
import { sendPush } from "@/lib/notifier";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { tierId } = await req.json();

    if (!tierId) {
      return NextResponse.json({ message: "tierId is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const alreadyClaimed = user.claimedRewards?.some((r: any) => r.tierId === tierId);
    if (alreadyClaimed) {
      return NextResponse.json(
        { message: "Reward already claimed" },
        { status: 400 },
      );
    }

    const tier = await Reward.findById(tierId);
    if (!tier) {
      return NextResponse.json({ message: "Invalid tier" }, { status: 404 });
    }

    const verifiedCount = await User.countDocuments({
      referBy: user.referralCode,
      status: "Verified",
    });

    if (verifiedCount < tier.recruits) {
      return NextResponse.json(
        { message: "Target not reached yet" },
        { status: 400 },
      );
    }

    const trackingNumber = `REW-TRC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    user.claimedRewards.push({
      tierId: tier._id.toString(),
      name: tier.name,
      reward: tier.reward,
      status: "Processing",
      claimedAt: new Date(),
    });
    await user.save();

    await ClaimedReward.create({
      userId: user._id,
      tierId: tier._id.toString(),
      rewardName: tier.name,
      rewardValue: tier.reward,
      level: tier.level,
      status: "Processing",
      trackingNumber,
    });

    await Notification.create({
      userId: user._id,
      NotificationType: "Reward Claimed",
      message: `User claimed reward ${tier.level}. Status: Processing.`,
      amount: null,
      ip: "///",
      isArchieved: false,
      status: "No Read",
    });

    sendPush(
      user._id,
      "Reward Claimed Successfully",
      `Mubarak ho! Aapka ${tier.reward} claim ho gaya hai. Status: Processing.`,
      "/rewards",
    ).catch((e) => console.error(e));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CLAIM REWARD ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
