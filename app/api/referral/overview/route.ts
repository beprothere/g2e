export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token)
      return NextResponse.json({ message: "Token missing" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const allReferralTxns = await Transaction.find({
      userId: user._id,
      status: "Completed",
      type: { $in: ["Level 1 Referral", "Level 2 Referral"] },
    }).lean();

    const level1Users = await User.find({ referBy: user.referralCode }).lean();
    const level1Codes = level1Users.map((u) => u.referralCode);

    const level2Users =
      level1Codes.length > 0
        ? await User.find({ referBy: { $in: level1Codes } }).lean()
        : [];

    const referralTree = level1Users.map((u1) => {
      const txnL1 = allReferralTxns.find(
        (t) => t.from === u1.fullName && t.type === "Level 1 Referral",
      );

      const children = level2Users
        .filter((u2) => u2.referBy === u1.referralCode)
        .map((u2) => {
          const txnL2 = allReferralTxns.find(
            (t) => t.from === u2.fullName && t.type === "Level 2 Referral",
          );
          return {
            name: u2.fullName,
            email: u2.email,
            level: 2,
            date: new Date(u2.createdAt).toDateString(),
            status: u2.status,
            earnings: txnL2 ? txnL2.amount : 0,
            commRate: txnL2 ? txnL2.comisionrate : 0,
          };
        });

      return {
        name: u1.fullName,
        email: u1.email,
        level: 1,
        date: new Date(u1.createdAt).toDateString(),
        status: u1.status,
        earnings: txnL1 ? txnL1.amount : 0,
        commRate: txnL1 ? txnL1.comisionrate : 0,
        children,
      };
    });

    const totalWithdrawBalance = allReferralTxns.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0,
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        referralCode: user.referralCode,
        stats: {
          level1Count: level1Users.length,
          level2Count: level2Users.length,
          totalWithdrawBalance:
            totalWithdrawBalance || user.withdrawBalance || 0,
        },
        referralTree,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
