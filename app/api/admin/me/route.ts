import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import AdminRole from "@/models/AdminRole";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return NextResponse.json(null, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const admin = await AdminUser.findById(decoded.id).lean();

    if (!admin) return NextResponse.json(null, { status: 401 });
    let roleData = null;
    if (admin.role) {
      roleData = await AdminRole.findById(admin.role).lean();
    }

    return NextResponse.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatar,
      isSuperAdmin: admin.isSuperAdmin,
      role: roleData ? {
          name: (roleData as any).name,
          pages: admin.rolePages || [],
        } : null,
    });

  } catch (err: any) {
    console.error("API Final Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}