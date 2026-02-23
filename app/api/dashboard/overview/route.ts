import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction"; 
import SerumOrder from "@/models/SerumOrder";
import SerumModel from "@/models/Serum";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const token = cookie.split("; ").find((c) => c.startsWith("auth_token="))?.split("=")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const user: any = await User.findById(decoded.id)
      .select("withdrawBalance pendingDeposit referralCode")
      .lean();

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const referralTransactions = await Transaction.find({
      userId: decoded.id,
      status: "Completed",
      type: { $in: ["Level 1 Referral", "Level 2 Referral"] }
    }).lean();

    const totalReferralEarnings = referralTransactions.reduce(
      (acc: number, curr: any) => acc + (curr.amount || 0), 
      0
    );

    const [level1Users, orderDoc, catalogSerum] = await Promise.all([
      User.find(
        { referBy: user.referralCode, status: "Verified" },
        { fullName: 1, createdAt: 1, referralCode: 1 }
      ).sort({ createdAt: -1 }).lean(),
      SerumOrder.findOne({ userId: decoded.id }).sort({ createdAt: -1 }).lean(),
      SerumModel.findOne().sort({ createdAt: -1 }).lean(),
    ]);

    const level1Codes = level1Users.map((u: any) => u.referralCode);
    const level2Users = level1Codes.length
      ? await User.find(
          { referBy: { $in: level1Codes }, status: "Verified" },
          { fullName: 1, createdAt: 1 }
        ).sort({ createdAt: -1 }).lean()
      : [];

    // 3. Level 1 with Commission Rate from Transaction
    const l1Processed = level1Users.map((u: any) => {
      const txn = referralTransactions.find(t => t.from === u.fullName && t.type === "Level 1 Referral");
      return {
        name: u.fullName,
        date: u.createdAt,
        earnings: txn ? txn.amount : 0,
        commissionRate: txn ? txn.comisionrate : 0, 
        status: "Verified",
        level: "Direct",
      };
    });
    
    const l2Processed = level2Users.map((u: any) => {
      const txn = referralTransactions.find(t => t.from === u.fullName && t.type === "Level 2 Referral");
      return {
        name: u.fullName,
        date: u.createdAt,
        earnings: txn ? txn.amount : 0,
        commissionRate: txn ? txn.comisionrate : 0,
        status: "Verified",
        level: "In Direct",
      };
    });

    const recentReferrals = [...l1Processed, ...l2Processed]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    return NextResponse.json({
      stats: {
        withdrawBalance: totalReferralEarnings, 
        pendingDeposit: user.pendingDeposit || 0,
        directReferrals: level1Users.length,
        level2Referrals: level2Users.length,
      },
      recentReferrals,
      order: orderDoc || null,
      catalogSerum: catalogSerum || null,
    });
  } catch (error) {
    console.error("Dashboard overview API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}