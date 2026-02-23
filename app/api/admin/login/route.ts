import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import "@/models/AdminRole";

import { sendMail } from "@/app/lib/mail/sendMail";
import { sendAdminLoginAlert } from "@/app/lib/mail/templates/security";
import { parseDevice } from "@/app/lib/utils/device";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const admin = await AdminUser.findOne({ email }).populate("role");

  if (!admin || !admin.password) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown IP";

  const userAgent = req.headers.get("user-agent") || "";
  const { device, os, browser } = parseDevice(userAgent);

  const time = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
  });

  sendMail(
    admin.email,
    "Admin Login Successful",
    sendAdminLoginAlert({
      device,
      os,
      browser,
      ip,
      time,
    }),
    "update"
  ).catch(() => {});

  const token = jwt.sign(
    {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      roleName: admin.isSuperAdmin ? "Super Admin" : (admin.role as any)?.name || "Admin",
      isSuperAdmin: admin.isSuperAdmin,
      rolePages: admin.isSuperAdmin ? ["*"] : admin.rolePages || [],
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
