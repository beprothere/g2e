import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import LoginRequest from "@/models/LoginRequest";
import LoginAttempt from "@/models/LoginAttempt";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || !action) return NextResponse.json({ message: "Invalid" }, { status: 400 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const request = await LoginRequest.findById(decoded.requestId);
    if (!request) return NextResponse.json({ message: "Expired" }, { status: 400 });

    if (action === "no") {
      await LoginAttempt.findOneAndUpdate(
        { ip: request.ip },
        { isBlocked: true, attempts: 8, blockedAt: new Date() },
        { upsert: true }
      );
      await User.findByIdAndUpdate(request.userId, { status: "Blocked" });
      return NextResponse.redirect(`${process.env.APP_URL}/login-denied?blocked=true`);
    }

    // YES it's me
    request.approved = true;
    await request.save();
    return NextResponse.redirect(`${process.env.APP_URL}/login-confirmed?confirmed=true`);
  } catch (err) {
    return NextResponse.json({ message: "Invalid Token" }, { status: 400 });
  }
}