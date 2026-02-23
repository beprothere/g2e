import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import TrustedDevice from "@/models/TrustedDevice";
import LoginRequest from "@/models/LoginRequest";
import { getClientIp } from "@/lib/getClientIp";
import { sendMail } from "@/app/lib/mail/sendMail";
import { loginSuccessful } from "@/app/lib/mail/templates/security";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { otp, tempToken } = await req.json();

    if (!otp || !tempToken) {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { message: "OTP session expired" },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { message: "2FA not configured properly" },
        { status: 400 }
      );
    }

    /* ===============================
       🔐 VERIFY TOTP (Authenticator)
    =============================== */
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: String(otp),
      window: 1,
    });

    if (!verified) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    const ip = await getClientIp();
    const device = req.headers.get("user-agent") || "Unknown device";

    /* ===============================
       🔐 SAVE TRUSTED DEVICE
    =============================== */
    await TrustedDevice.findOneAndUpdate(
      { userId: user._id, ip, device },
      {
        userId: user._id,
        ip,
        device,
        verified: true,
        verifiedAt: new Date(),
      },
      { upsert: true }
    );

    /* ===============================
       🧹 CLEAN LOGIN REQUEST
    =============================== */
    await LoginRequest.deleteMany({
      userId: user._id,
      ip,
      device,
    });

    /* ===============================
       🍪 ISSUE AUTH COOKIE
    =============================== */
    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    /* ===============================
       📧 SUCCESS LOGIN EMAIL
    =============================== */
    await sendMail(
      user.email,
      "Successful Login",
      loginSuccessful(ip, device),
      "security"
    );

    const res = NextResponse.json({ success: true });

    res.cookies.set("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
