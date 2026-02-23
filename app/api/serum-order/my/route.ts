import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SerumOrder from "@/models/SerumOrder";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectDB();

  const cookie = req.headers.get("cookie");
  const authRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`,
    {
      headers: { cookie: cookie || "" },
      cache: "no-store",
    }
  );

  const authData = await authRes.json();
  if (!authData.user) {
    return NextResponse.json({ order: null });
  }

  const user = await User.findById(authData.user._id);

  const order = await SerumOrder.findOne({
    userId: user._id,
  });

  return NextResponse.json({ order });
}
