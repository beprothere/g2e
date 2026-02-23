import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({ status: "Blocked" })
      .select("fullName email avatar status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const data = users.map((user: any) => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || "",
      status: user.status,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Blocked users API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blocked users" },
      { status: 500 },
    );
  }
}
