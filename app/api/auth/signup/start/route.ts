export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import TempSignup from "@/models/TempSignup";
import {
  generateReferralCode,
  strongPassword,
  hashValue,
} from "@/utils/helpers";
import { sendMail } from "@/app/lib/mail/sendMail";
import { verifyEmailOTP } from "@/app/lib/mail/templates/security";

export async function POST(req: Request) {
  await connectDB();

  const { fullName, email, password, referBy, deviceFingerprint } =
    await req.json();

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { message: "All fields required" },
      { status: 400 },
    );
  }

  if (!strongPassword(password)) {
    return NextResponse.json(
      { message: "Password is not strong enough" },
      { status: 400 },
    );
  }

  if (await User.findOne({ email })) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 400 },
    );
  }

  if (referBy) {
    const refUser = await User.findOne({ referralCode: referBy });
    if (!refUser) {
      return NextResponse.json(
        { message: "Invalid referral code" },
        { status: 400 },
      );
    }
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  const ipHash = hashValue(ip);

  let deviceHash = null;
  if (deviceFingerprint && deviceFingerprint !== "unknown") {
    deviceHash = hashValue(deviceFingerprint);

    const deviceExists = await User.findOne({
      deviceFingerprint: deviceHash,
    })
      .select("_id")
      .lean();

    if (deviceExists) {
      return NextResponse.json(
        {
          message:
            "An account is already registered on this device. Only one account allowed.",
        },
        { status: 400 },
      );
    }
  }

  const ipAccountsCount = await User.countDocuments({ ipHash });
  if (ipAccountsCount >= 10) {
    return NextResponse.json(
      {
        message: "Maximum account limit reached for this internet connection.",
      },
      { status: 400 },
    );
  }

  let temp = await TempSignup.findOne({ email });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 Hours

  if (temp) {
    temp.emailOTP = otp;
    temp.emailOTPExpiry = otpExpiry;
    temp.fullName = fullName;
    temp.deviceFingerprint = deviceHash;
    temp.ipHash = ipHash;
    temp.ipAddress = ip;
    await temp.save();
  } else {
    let referralCode = "";
    let exists = true;
    while (exists) {
      referralCode = generateReferralCode();
      exists = !!(await User.findOne({ referralCode }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await TempSignup.create({
      fullName,
      email,
      password: hashedPassword,
      referBy: referBy || null,
      referralCode,
      emailOTP: otp,
      emailOTPExpiry: otpExpiry,
      deviceFingerprint: deviceHash,
      ipHash,
      ipAddress: ip,
    });
  }

  try {
    await sendMail(
      email,
      "Verify Your Email",
      verifyEmailOTP(fullName, otp),
      "security",
    );
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, email }, { status: 200 });
}
