import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminRole from "@/models/AdminRole";

/* ================= GET ALL ROLES ================= */
export async function GET() {
  await connectDB();
  const roles = await AdminRole.find().sort({ createdAt: -1 });
  return NextResponse.json(roles);
}

/* ================= CREATE ROLE ================= */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json(
      { message: "Role name is required" },
      { status: 400 }
    );
  }

  const role = await AdminRole.create({
    name: body.name,
    pages: body.pages || [],
  });

  return NextResponse.json(role);
}
