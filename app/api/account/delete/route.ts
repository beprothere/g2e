export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import DeletedUser from "@/models/DeletedUser";
import { accountDeleted } from "@/app/lib/mail/templates/account";
import { sendMail } from "@/app/lib/mail/sendMail";

export async function DELETE(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "Unknown IP";

    const device = req.headers.get("user-agent") || "Unknown Device";
    const deletedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    await DeletedUser.create({
      originalUserId: user._id.toString(),
      data: user.toObject(),
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Account Deleted Successfully</h2>

        <p>Hello ${user.name || "User"},</p>

        <p>
          This email confirms that your account has been
          <strong>permanently deleted</strong>.
        </p>

        <h4>Deletion Details</h4>
        <ul>
          <li><strong>Date & Time:</strong> ${deletedAt}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device:</strong> ${device}</li>
        </ul>

        <p>
          If you did not perform this action, please contact our support team
          immediately.
        </p>

        <p>
          Regards,<br />
          <strong>Glow2Earn Security Team</strong>
        </p>
      </div>
    `;

    await User.findByIdAndDelete(decoded.id);

    await sendMail(
      user.email,
      "Your Glow2Earn Account Has Been Permanently Deleted",
      accountDeleted(user.name || "User", {
        "Date & Time": deletedAt,
        IP: ip,
        Device: device,
      }),
      "security",
    );

    const res = NextResponse.json({
      message: "Account deleted permanently",
    });

    res.cookies.set("auth_token", "", {
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
