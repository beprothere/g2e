import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

/* ================= UPDATE ADMIN ================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // ✅ NEXT 15 FIX
    const { id } = await context.params;

    console.log("ADMIN ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid admin id" },
        { status: 400 }
      );
    }

    const adminId = new mongoose.Types.ObjectId(id);
    const body = await req.json();

    console.log("UPDATE BODY:", body);

    // 🔥 FIRST FIND USER
    const existingUser = await AdminUser.findById(adminId);

    if (!existingUser) {
      return NextResponse.json(
        { message: "Admin user not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // email (only if changed)
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await AdminUser.findOne({
        email: body.email,
        _id: { $ne: adminId },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }

      updateData.email = body.email;
    }

    // avatar (base64)
    if (typeof body.avatar === "string" && body.avatar.length > 0) {
      updateData.avatar = body.avatar;
    }

    // role
    if (typeof body.role === "string" && body.role.length > 0) {
      updateData.role = body.role;
    }

    // pages
    if (Array.isArray(body.rolePages)) {
      updateData.rolePages = body.rolePages;
    }

    // password (hash)
    if (typeof body.password === "string" && body.password.length > 0) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    const updatedUser = await AdminUser.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true }
    );

    console.log("UPDATED USER:", updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ADMIN ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;

  await AdminUser.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
