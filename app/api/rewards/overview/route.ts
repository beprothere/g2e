export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { Reward } from "@/models/Reward";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();

    const user = await User.findById(decoded.id).lean();
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const [verifiedLevel1Count, rewards] = await Promise.all([
      User.countDocuments({
        referBy: user.referralCode,
        status: "Verified",
      }),
      Reward.find({}).sort({ level: 1 }).lean(),
    ]);

    return NextResponse.json({
      verifiedLevel1Count,
      claimedRewards: user.claimedRewards || [],
      rewards: rewards.map((item: any) => ({
        _id: item._id?.toString(),
        name: item.name,
        level: item.level,
        recruits: item.recruits,
        reward: item.reward,
        description: item.description,
        icon: item.icon,
        color: item.color,
        accentColor: item.accentColor,
      })),
    });
  } catch (err) {
    console.error("REWARD OVERVIEW ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
