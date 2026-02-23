import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import SerumOrder from "@/models/SerumOrder";
import { serumConfirmed } from "@/app/lib/mail/templates/serum";
import { sendMail } from "@/app/lib/mail/sendMail";
import { sendPush } from "@/lib/notifier";
import Notification from "@/models/Notifications";

export async function POST(req: Request) {
  await connectDB();

  const cookie = req.headers.get("cookie");

  const authRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`,
    {
      headers: { cookie: cookie || "" },
      cache: "no-store",
    },
  );

  const authData = await authRes.json();
  if (!authData.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { serum } = await req.json();

  const user = await User.findById(authData.user._id);
  if (!user || !user.profileStatus) {
    return NextResponse.json(
      { message: "Profile incomplete" },
      { status: 400 },
    );
  }

  const existingOrder = await SerumOrder.findOne({
    userId: user._id,
    serumId: serum._id,
  });

  if (existingOrder) {
    return NextResponse.json({ order: existingOrder }, { status: 200 });
  }

  const order = await SerumOrder.create({
    userId: user._id,

    fullName: user.fullName,
    email: user.email,
    phone: user.phone,

    address: user.address,
    city: user.city,
    zipcode: user.zipcode,
    country: user.country,

    serumId: serum._id,
    serumName: serum.serumname,
    serumPic: serum.serumpic,

    trackingNumber: "SRM-" + Date.now(),
  });

  await Notification.create({
    userId: user._id,
    NotificationType: "Serum Order Confirmed ✨",
    message: `User ordered a serum ${serum.serumname}. Status: Confirmed.`,
    amount: null,
    ip: "///",
    isArchieved: false,
    status: "No Read",
  });

  sendPush(
    user._id,
    "Serum Order Confirmed! ✨",
    `Congratulations! Your ${serum.serumname} serum has been confirmed.`,
    "/serum-orders",
  ).catch((e) => console.error(e));

  await sendMail(
    user.email,
    "Serum Order Confirmed",
    serumConfirmed(order.trackingNumber),
    "update",
  );

  return NextResponse.json({ order });
}
