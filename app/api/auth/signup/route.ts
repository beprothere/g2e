export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  generateReferralCode,
  strongPassword,
  hashValue,
} from "@/utils/helpers";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { fullName, email, password, referBy, deviceFingerprint } = body;

    console.log("SIGNUP BODY:", body);

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!strongPassword(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
        },
        { status: 400 }
      );
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    if (referBy) {
      const refUser = await User.findOne({ referralCode: referBy });
      if (!refUser) {
        return NextResponse.json(
          { message: "Invalid referral code" },
          { status: 400 }
        );
      }
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    const ipHash = hashValue(ip);
    const deviceHash = hashValue(deviceFingerprint ?? "unknown");

    const alreadyUsed = await User.findOne({
      $or: [{ ipHash }, { deviceFingerprint: deviceHash }],
    });

    if (alreadyUsed) {
      return NextResponse.json(
        { message: "Only one account allowed per device or network" },
        { status: 400 }
      );
    }

    let referralCode = "";
    let exists = true;

    while (exists) {
      referralCode = generateReferralCode();
      exists = !!(await User.findOne({ referralCode }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      referBy: referBy || null,
      referralCode,
      address: "",
      avatar: "",
      deviceFingerprint: deviceHash,
      latestDepositAmount: 0,
      latestDepositCommissionProcessed: false,
      ipHash,
      resetOTP: "",
      resetOTPExpiry: "",
      ipAddress: ip,
      status: "Pending",
      accountstatus: "Activated",
    });

    try {
      await sendMail(
        email,
        "Welcome to Zeenetwork",
        `
          <div style="font-family: Arial, sans-serif">
            <h2>Welcome, ${fullName}!</h2>
            <p>Your account has been successfully created.</p>
            <p><strong>Your Referral Code:</strong> ${referralCode}</p>
            <p>You can now login and start using Zeenetwork.</p>
            <br/>
            <p>Regards,<br/>Zeenetwork Team</p>
          </div>
        `
      );
    } catch (mailErr) {
      console.error("SIGNUP EMAIL FAILED (IGNORED):", mailErr);
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ SIGNUP API CRASH:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
