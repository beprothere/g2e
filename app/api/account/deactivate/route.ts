export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newStatus =
      user.accountstatus === "Activated" ? "Deactivated" : "Activated";

    user.accountstatus = newStatus;
    await user.save();

    return NextResponse.json({
      message:
        newStatus === "Deactivated"
          ? "Account deactivated successfully"
          : "Account activated successfully",
      status: newStatus,
    });
  } catch (err) {
    console.error("ACCOUNT STATUS ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
