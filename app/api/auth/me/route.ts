export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const DEFAULT_VALUES: Record<string, string> = {
  address: "123 Main Street",
  city: "New York",
  zipcode: "12345",
  country: "Pakistan",
  phone: "+1 (555) 000-0000",
  avatar: "/img/avatar.png",
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.delete("auth_token");
      return res;
    }

    await connectDB();

    const user = await User.findById(decoded.id).select(
      "fullName email phone country city referralCode investedBalance availableWithdraw pendingWithdraw profileStatus address zipcode avatar role depositBalance twoFactorEnabled withdrawBalance pendingDeposit status createdAt",
    );

    if (!user) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.delete("auth_token");
      return res;
    }

    const requiredFields = ["phone", "city", "address", "zipcode", "avatar"];

    const incompleteFields = requiredFields.filter((field) => {
      const value = (user as any)[field];
      if (!value) return true;
      if (DEFAULT_VALUES[field] && value === DEFAULT_VALUES[field]) return true;
      return false;
    });

    const isComplete = incompleteFields.length === 0;

    if (user.profileStatus !== isComplete) {
      user.profileStatus = isComplete;
      await user.save();
    }

    return NextResponse.json(
      {
        user,
        incompleteFields,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("ME API ERROR:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
