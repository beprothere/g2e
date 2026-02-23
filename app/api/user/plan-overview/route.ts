export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthToken } from "@/lib/getAuthToken";
import { getVerifiedLevel1Count } from "@/lib/getLevel1Count";

export async function GET(req: Request) {
  const token = getAuthToken(req.headers.get("cookie"));
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  await connectDB();
  const user = await User.findById(decoded.id);
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const level1Count = await getVerifiedLevel1Count(user);

  return NextResponse.json({
    planName: user.planName || "Free",
    planPrice: user.planPrice || 0,
    commissionRate: user.commissionRate || 30,
    level1Count,
    depositBalance: user.depositBalance,
    availableWithdraw: user.availableWithdraw,
  });
}
