export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { currentPassword, otp } = await req.json();

    if (!currentPassword || !otp) {
      return NextResponse.json(
        { message: "Password and OTP are required" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();

    const user = await User.findById(decoded.id).select(
      "password twoFactorSecret twoFactorEnabled"
    );

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { message: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    // 🔐 PASSWORD CHECK
    const passwordOk = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordOk) {
      return NextResponse.json(
        { message: "Invalid account password" },
        { status: 400 }
      );
    }

    const otpOk = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!otpOk) {
      return NextResponse.json(
        { message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return NextResponse.json({
      message: "Two-factor authentication disabled successfully",
    });
  } catch (err) {
    console.error("2FA DISABLE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to disable two-factor authentication" },
      { status: 500 }
    );
  }
}
