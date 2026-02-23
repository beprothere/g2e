export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: Request) {
  const prefs = await req.json();

  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  await connectDB();

  await User.findByIdAndUpdate(decoded.id, {
    emailPreferences: prefs,
  });

  return NextResponse.json({ message: "Email preferences updated" });
}
