export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import WithdrawAccount from "@/models/WithdrawAccount";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { accountId } = await req.json();

    await connectDB();

    await WithdrawAccount.updateMany(
      { userId: decoded.id },
      { isPrimary: false }
    );

    await WithdrawAccount.findByIdAndUpdate(accountId, {
      isPrimary: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SET PRIMARY ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
