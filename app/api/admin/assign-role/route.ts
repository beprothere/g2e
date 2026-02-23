import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import AdminRole from "@/models/AdminRole";

export async function POST(req: Request) {
  await connectDB();

  const { userId, roleId, pages } = await req.json();

  if (!userId || !roleId || !Array.isArray(pages)) {
    return NextResponse.json(
      { message: "userId, roleId and pages are required" },
      { status: 400 }
    );
  }

  const role = await AdminRole.findById(roleId);
  if (!role) {
    return NextResponse.json(
      { message: "Role not found" },
      { status: 404 }
    );
  }

  const updatedUser = await AdminUser.findByIdAndUpdate(
    userId,
    {
      role: roleId,
      rolePages: pages, // ✅ THIS WAS THE MAIN THING
    },
    { new: true }
  ).populate("role", "name");

  return NextResponse.json({
    success: true,
    user: updatedUser, // ✅ return updated user
  });
}
