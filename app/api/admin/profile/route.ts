import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const cookieString = req.headers.get("cookie") || "";
    const token = cookieString
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const body = await req.json();
    const update: any = {
      name: body.name,
      email: body.email,
      avatar: body.avatar,
    };

    if (body.password) {
      update.password = await bcrypt.hash(body.password, 10);
    }

    const updatedAdmin = await AdminUser.findByIdAndUpdate(decoded.id, update, { new: true });
    
    if (!updatedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile Update Error:", error.message);
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 500 });
  }
}