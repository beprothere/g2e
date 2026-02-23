export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendMail } from "@/app/lib/mail/sendMail";
import { forgotPasswordOTP } from "@/app/lib/mail/templates/security";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ message: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email });

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const otp = generateOTP();

    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendMail(
      user.email,
      "Password Reset OTP",
      forgotPasswordOTP(user.fullName, otp),
      "security",
    );
    return NextResponse.json({ message: "OTP sent to email" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
