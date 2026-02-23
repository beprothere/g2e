export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import LoginAttempt from "@/models/LoginAttempt";
import TrustedDevice from "@/models/TrustedDevice";
import LoginRequest from "@/models/LoginRequest";
import { sendMail } from "@/app/lib/mail/sendMail";
import { getClientIp } from "@/lib/getClientIp";
import { confirmLoginAttempt } from "@/app/lib/mail/templates/security";
import { paymentPending } from "@/app/lib/mail/templates/account";
import { loginBlocked, loginSuccessful } from "@/app/lib/mail/templates/security";

import { sendPush } from "@/lib/notifier";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    const ip = await getClientIp();
    const device = req.headers.get("user-agent") || "Unknown device";

    const ipAttempt = await LoginAttempt.findOne({ ip });
    if (ipAttempt?.isBlocked) {
      return NextResponse.json(
        { message: "This IP is blocked due to security reasons." },
        { status: 403 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      await LoginAttempt.findOneAndUpdate(
        { ip },
        { $inc: { attempts: 1 }, lastEmailTried: email },
        { upsert: true }
      );

      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 400 }
      );
    }

    if (user.status === "Blocked") {
      return NextResponse.json(
        { message: "Your account has been blocked. Contact support." },
        { status: 403 }
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      const attempt = await LoginAttempt.findOneAndUpdate(
        { ip },
        { $inc: { attempts: 1 }, lastEmailTried: email },
        { upsert: true, new: true }
      );

      if (attempt.attempts >= 8) {
        attempt.isBlocked = true;
        attempt.blockedAt = new Date();
        await attempt.save();

        await sendPush(
          user._id.toString(),
          "Security Alert! 🛡️",
          "Multiple failed login attempts detected. IP has been blocked.",
          "/support"
        );

        await sendMail(
          email,
          "Security Alert: Login Blocked",
          loginBlocked(ip, device),
          "security"
        );

        return NextResponse.json(
          { message: "Too many attempts. IP blocked." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          message:
            attempt.attempts >= 4
              ? `Invalid password. Warning ${attempt.attempts}/8 attempts used.`
              : "Invalid email or password",
        },
        { status: 400 }
      );
    }

    await LoginAttempt.deleteOne({ ip });

    if (!user.isPaid) {
      await sendMail(
        user.email,
        "Payment Verification Pending",
        paymentPending(),
        "update"
      );

      return NextResponse.json(
        { message: "Payment pending. Please wait 1–24 hours for approval." },
        { status: 403 }
      );
    }

    if (!user.twoFactorEnabled) {
      const authToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      await sendPush(
        user._id.toString(),
        "Login Successful! ✅",
        `New login detected from ${ip}. If this wasn't you, change your password.`,
        "/profile"
      );

      await sendMail(
        user.email,
        "Successful Login",
        loginSuccessful(ip, device),
        "security"
      );

      const res = NextResponse.json({ success: true });

      res.cookies.set("auth_token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    const trusted = await TrustedDevice.findOne({
      userId: user._id,
      ip,
      device,
      verified: true,
    });

    if (trusted) {
      const authToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      await sendPush(
        user._id.toString(),
        "Welcome Back! 👋",
        "Logged in via trusted device.",
        "/dashboard"
      );

      await sendMail(
        user.email,
        "Successful Login",
        loginSuccessful(ip, device),
        "security"
      );

      const res = NextResponse.json({ success: true });

      res.cookies.set("auth_token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    const request = await LoginRequest.create({
      userId: user._id,
      ip,
      device,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const token = jwt.sign(
      { requestId: request._id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    await sendPush(
      user._id.toString(),
      "Login Verification 🛡️",
      "An unknown device is trying to login. Please check your email to verify.",
      "/"
    );

    const yesUrl = `${process.env.APP_URL}/api/auth/confirm-device?token=${token}&action=yes`;
    const noUrl = `${process.env.APP_URL}/api/auth/confirm-device?token=${token}&action=no`;

    await sendMail(
      user.email,
      "Confirm Login Attempt",
      confirmLoginAttempt(ip, device, yesUrl, noUrl),
      "security"
    );

    return NextResponse.json({
      requireEmailConfirm: true,
      requestId: request._id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}