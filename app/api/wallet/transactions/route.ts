export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();

    const transactions = await Transaction.find({
      userId: decoded.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        _id: tx._id.toString(),
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        from: tx.from,
        date: new Date(tx.createdAt).toDateString(),
      })),
    });
  } catch (err) {
    console.error("TRANSACTIONS FETCH ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
