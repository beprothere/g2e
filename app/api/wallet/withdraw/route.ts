export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import WithdrawAccount from "@/models/WithdrawAccount";
import Notification from "@/models/Notifications";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();

    const { amount, accountId } = await req.json();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount))
      return NextResponse.json(
        { message: "Invalid withdrawal amount" },
        { status: 400 }
      );

    const user = await User.findById(decoded.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (parsedAmount < 10)
      return NextResponse.json(
        { message: "Minimum withdraw is $10" },
        { status: 400 }
      );

    const available = Number(user.availableWithdraw || 0);
    if (available <= 0)
      return NextResponse.json(
        { message: "No available balance" },
        { status: 400 }
      );

    if (parsedAmount > available)
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );

    const account = await WithdrawAccount.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!account)
      return NextResponse.json(
        { message: "Invalid withdraw account" },
        { status: 400 }
      );

    const round2 = (value: number) =>
      Math.round((value + Number.EPSILON) * 100) / 100;

    user.availableWithdraw = round2(Math.max(0, available - parsedAmount));
    user.pendingWithdraw = round2(
      Number(user.pendingWithdraw || 0) + parsedAmount
    );
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "Withdrawal",
      amount: parsedAmount,
      status: "Pending",
      from: `${account.method} - ${account.number} (${account.holderName})`,
    });

    await Notification.create({
      userId: user._id,
      NotificationType: "Withdrawal",
      message: `User submitted a withdrawal request of $${parsedAmount}. Pending approval.`,
      amount: parsedAmount,
      ip: "///",
      isArchieved: false,
      status: "No Read",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WITHDRAW ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
