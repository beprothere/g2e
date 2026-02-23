import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find({}, "fullName email avatar _id").lean();
  return NextResponse.json(users);
}