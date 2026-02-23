export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();

    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { message: "2FA not initialized" },
        { status: 400 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({
      message: "Two-factor authentication enabled",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
