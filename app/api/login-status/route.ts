export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import LoginRequest from "@/models/LoginRequest";

export async function POST(req: Request) {
  await connectDB();
  const { loginRequestId } = await req.json();

  const reqDoc = await LoginRequest.findById(loginRequestId);
  if (!reqDoc || !reqDoc.approved) {
    return NextResponse.json({ approved: false });
  }

  const tempToken = jwt.sign(
    { id: reqDoc.userId, step: "2fa" },
    process.env.JWT_SECRET!,
    { expiresIn: "5m" }
  );

  return NextResponse.json({
    approved: true,
    tempToken,
  });
}
