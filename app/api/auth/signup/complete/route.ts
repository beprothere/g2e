export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TempSignup from "@/models/TempSignup";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notifications";
import { sendMail } from "@/app/lib/mail/sendMail";
import { accountCreated } from "@/app/lib/mail/templates/account";
import { sendPush } from "@/lib/notifier";

export async function POST(req: Request) {
  await connectDB();

  const {
    email,
    otp,
    paymentMethod,
    transactionId,
    receiptBase64,
  } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email & OTP required" },
      { status: 400 },
    );
  }

  const temp = await TempSignup.findOne({ email });
  if (!temp) {
    return NextResponse.json(
      { message: "Signup session expired. Please start again." },
      { status: 400 },
    );
  }

  if (temp.emailOTP !== otp) {
    return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
  }

  if (!temp.emailOTPExpiry || temp.emailOTPExpiry < new Date()) {
    return NextResponse.json(
      { message: "OTP has expired. Please request a new one." },
      { status: 400 },
    );
  }

  const user = await User.create({
    fullName: temp.fullName,
    email: temp.email,
    password: temp.password,
    referBy: temp.referBy,
    referralCode: temp.referralCode,
    emailVerified: true,
    paymentMethod,
    transactionId,
    paymentReceipt: receiptBase64,
    pendingDeposit: 20,
    isPaid: false,
    deviceFingerprint: temp.deviceFingerprint,
    ipHash: temp.ipHash,
    ipAddress: temp.ipAddress,
  });

  await Transaction.create({
    userId: user._id,
    type: "Deposit",
    amount: 20,
    ip: temp.ipAddress,
    status: "Pending",
    from: `${paymentMethod?.toUpperCase() || "PAYMENT"} | TID: ${transactionId}`,
  });

  await Notification.create({
    userId: user._id,
    NotificationType: "Deposit",
    message:
      "User successfully created an account with an initial deposit of $20. Pending approval.",
    amount: 20,
    ip: temp.ipAddress,
    isArchieved: false,
    status: "No Read",
  });

  sendPush(
    user._id,
    "Account Created Successfully",
    "Your account has been created. Initial deposit of $20 is pending approval.",
    "/profile",
  ).catch((e: any) => console.error("Notification Error:", e));

  await TempSignup.deleteOne({ _id: temp._id });

  await sendMail(
    user.email,
    "Account Created Successfully",
    accountCreated(user.fullName, {
      IP: user.ipAddress,
      Device: req.headers.get("user-agent") || "Unknown",
      Date: new Date().toLocaleString(),
      "Payment Method": paymentMethod,
      "Transaction ID": transactionId,
      Amount: "$20 (Pending)",
    }),
    "update",
  );

  return NextResponse.json({ success: true }, { status: 200 });
}
