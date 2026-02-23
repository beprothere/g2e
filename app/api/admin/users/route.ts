import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import "@/models/AdminRole";

/* ================= GET ALL ADMIN USERS ================= */
export async function GET() {
  await connectDB();
  const users = await AdminUser.find()
    .select("-password")
    .populate("role", "name pages")
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ success: true, users });
}

/* ================= CREATE ADMIN USER ================= */
export async function POST(req: Request) {
  await connectDB();
  const { email, password, avatar } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password required" },
      { status: 400 }
    );
  }

  const exists = await AdminUser.findOne({ email });
  if (exists) {
    return NextResponse.json(
      { message: "Admin user already exists" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await AdminUser.create({
    email,
    password: hashed,
    avatar: avatar,
    isSuperAdmin: false,
  });

  return NextResponse.json(user);
}
