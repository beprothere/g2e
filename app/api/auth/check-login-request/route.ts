import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LoginRequest from "@/models/LoginRequest";
import LoginAttempt from "@/models/LoginAttempt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();

  const { requestId } = await req.json();

  const request = await LoginRequest.findById(requestId);

  if (!request) {
    return NextResponse.json({
      approved: false,
      blocked: false,
      status: "expired",
    });
  }

  const ipAttempt = await LoginAttempt.findOne({ ip: request.ip });

  if (ipAttempt?.isBlocked) {
    await LoginRequest.deleteOne({ _id: requestId });

    return NextResponse.json({
      approved: false,
      blocked: true,
      status: "blocked",
    });
  }

  if (!request.approved) {
    return NextResponse.json({
      approved: false,
      blocked: false,
      status: "pending",
    });
  }

  const tempToken = jwt.sign(
    { id: request.userId, step: "2fa" },
    process.env.JWT_SECRET!,
    { expiresIn: "5m" }
  );

  await LoginRequest.deleteOne({ _id: requestId });

  return NextResponse.json({
    approved: true,
    blocked: false,
    tempToken,
    status: "approved",
  });
}
