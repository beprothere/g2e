import { connectDB } from "@/lib/db";
import SerumOrder from "@/models/SerumOrder";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { serumReceived } from "@/app/lib/mail/templates/serum";
import { sendMail } from "@/app/lib/mail/sendMail";
import { sendPush } from "@/lib/notifier";

async function getCurrentUser(req: Request) {
  const cookie = req.headers.get("cookie");

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
    headers: { cookie: cookie || "" },
    cache: "no-store",
  });

  const data = await res.json();
  return data.user || null;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await context.params;

  const currentUser = await getCurrentUser(req);
  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const order = await SerumOrder.findById(id);
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  if (order.userId.toString() !== currentUser._id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (order.status === "received") {
    return NextResponse.json({ success: true });
  }

  order.status = "received";
  await order.save();

  const ipAddress =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown IP";

  const device = req.headers.get("user-agent") || "Unknown device";

  const receivedAt = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
  });

  const user = await User.findById(order.userId);

  sendPush(
    user._id,
    "Serum Order Received Successfully! ✨",
    `Congratulations! Your ${order.serumName} serum has been received.`,
    "/serum-orders",
  ).catch((e) => console.error(e));

  await sendMail(
    user.email,
    "Serum Order Received Successfully",
    serumReceived(user.fullName, {
      Product: order.serumName,
      "Date & Time": receivedAt,
      IP: ipAddress,
      Device: device,
    }),
    "update",
  );

  return NextResponse.json({ success: true });
}
