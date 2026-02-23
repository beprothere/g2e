export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { profileUpdated } from "@/app/lib/mail/templates/account";
import { sendMail } from "@/app/lib/mail/sendMail";


const REQUIRED_FIELDS = [
  "fullName",
  "email",
  "phone",
  "country",
  "address",
  "city",
  "zipcode",
];

export async function PUT(req: Request) {
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
    const body = await req.json();

    await connectDB();

    const existingUser = await User.findById(decoded.id);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const incompleteFields = REQUIRED_FIELDS.filter((field) => {
      const value =
        field === "email"
          ? existingUser.email
          : (body[field] ?? existingUser[field]);

      return !value || value.toString().trim() === "";
    });

    const profileStatus = incompleteFields.length === 0;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      {
        fullName: body.fullName,
        phone: body.phone,
        country: body.country,
        city: body.city,
        address: body.address,
        zipcode: body.zipcode,
        avatar: body.avatar,

        profileStatus,
        incompleteFields,
      },
      { new: true },
    );

    if (profileStatus) {
      await sendMail(
        user.email,
        "Profile Updated Successfully",
        profileUpdated(user.fullName),
        "update",
      );
    }

    return NextResponse.json({
      success: true,
      profileStatus,
      incompleteFields,
    });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
