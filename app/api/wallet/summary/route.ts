export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthToken } from "@/lib/getAuthToken";

export async function GET(req: Request) {
  try {
    const token = getAuthToken(req.headers.get("cookie"));
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();
    const user = await User.findById(decoded.id).lean();

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      totalEarning: user.withdrawBalance || 0,
      pendingWithdraw: user.pendingWithdraw || 0,
      availableWithdraw: user.availableWithdraw || 0,
      investedBalance: user.investedBalance || 0,
      pendingDeposit: user.pendingDeposit || 0,
      depositBalance: user.depositBalance || 0,
    });
  } catch (err) {
    console.error("WALLET SUMMARY ERROR:", err);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
