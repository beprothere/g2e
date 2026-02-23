export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `ZeeNetwork (${user.email})`,
      issuer: "ZeeNetwork",
    });

    if (!secret.otpauth_url) {
      return NextResponse.json(
        { message: "Failed to generate authenticator key" },
        { status: 500 }
      );
    }

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    return NextResponse.json({
      qrCode,
      manualKey: secret.base32,
    });
  } catch (err) {
    console.error("2FA SETUP ERROR:", err);
    return NextResponse.json(
      { message: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}
