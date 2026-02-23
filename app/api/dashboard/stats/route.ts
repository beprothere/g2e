export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

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
    const level1Users = await User.find(
      {
        referBy: user.referralCode,
        status: "Verified",
      },
      { fullName: 1, latestDepositAmount: 1, createdAt: 1, referralCode: 1 },
    )
      .sort({ createdAt: -1 })
      .lean();

    const level1Codes = level1Users.map((u) => u.referralCode);
    const level2Users = await User.find(
      {
        referBy: { $in: level1Codes },
        status: "Verified",
      },
      { fullName: 1, latestDepositAmount: 1, createdAt: 1 },
    )
    .sort({ createdAt: -1 })
    .lean();

    const recentReferrals = [
      ...level1Users.map((u) => ({
        name: u.fullName,
        date: u.createdAt,
        earnings: Number(((u.latestDepositAmount || 0) * 0.3).toFixed(2)),
        status: "Verified",
        level: "Level 1",
      })),
      ...level2Users.map((u) => ({
        name: u.fullName,
        date: u.createdAt,
        earnings: Number(((u.latestDepositAmount || 0) * 0.05).toFixed(2)),
        status: "Verified",
        level: "Level 2",
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    return NextResponse.json({
      withdrawBalance: user.withdrawBalance || 0,
      pendingDeposit: user.pendingDeposit || 0,
      directReferrals: level1Users.length,
      level2Referrals: level2Users.length,
      recentReferrals,
    });
  } catch (err) {
    console.error("DASHBOARD STATS ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
