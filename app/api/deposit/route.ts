export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { getAuthToken } from "@/lib/getAuthToken";
import { sendPush } from "@/lib/notifier";
import Notification from "@/models/Notifications";

export async function POST(req: Request) {
  try {
    const token = getAuthToken(req.headers.get("cookie"));
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const form = await req.formData();
    const method = form.get("method") as string;
    const amount = Number(form.get("amount"));
    const tid = form.get("tid") as string;
    const receipt = form.get("receipt") as File | null;

    if (!method || !amount || !tid || !receipt)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    if (amount <= 0)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    user.pendingDeposit += amount;

    const forwardedFor = req.headers.get("x-forwarded-for");
    const Ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "Deposit",
      amount,
      ip: Ip,
      status: "Pending",
      from: `${method.toUpperCase()} | TID: ${tid}`,
    });

    await Notification.create({
      userId: user._id,
      NotificationType: "Deposit",
      message: `User requested a deposit of $${amount}. Need approval.`,
      amount,
      ip: Ip,
      isArchieved: false,
      status: "No Read",
    });

    sendPush(
      user._id,
      "Deposit Pending✨",
      `Your deposit of $${amount} is pending approval. We will notify you once it's approved.`,
      "/deposit-topup",
    ).catch((e) => console.error(e));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DEPOSIT ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
