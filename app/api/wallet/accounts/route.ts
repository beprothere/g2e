export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import WithdrawAccount from "@/models/WithdrawAccount";

function getToken(cookie: string | null) {
  if (!cookie) return null;
  return cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];
}

export async function GET(req: Request) {
  try {
    const token = getToken(req.headers.get("cookie"));
    if (!token) return NextResponse.json({ accounts: [] });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const accounts = await WithdrawAccount.find({
      userId: decoded.id,
    }).lean();

    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("GET WALLET ACCOUNTS ERROR:", err);
    return NextResponse.json({ accounts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const token = getToken(req.headers.get("cookie"));
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const body = await req.json();

    await connectDB();

    const count = await WithdrawAccount.countDocuments({
      userId: decoded.id,
    });

    if (count >= 2) {
      return NextResponse.json(
        { message: "Maximum 2 withdrawal accounts allowed" },
        { status: 400 }
      );
    }

    if (count === 0) {
      body.isPrimary = true;
    }

    const account = await WithdrawAccount.create({
      userId: decoded.id,
      method: body.method,
      number: body.number,
      holderName: body.holderName,
      isPrimary: body.isPrimary || false,
    });

    return NextResponse.json({ account });
  } catch (err) {
    console.error("SAVE WALLET ACCOUNT ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = getToken(req.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const body = await req.json();
    const accountId = body.accountId || body.id;

    if (!accountId) {
      return NextResponse.json(
        { message: "Account id is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const account = await WithdrawAccount.findOneAndUpdate(
      { _id: accountId, userId: decoded.id },
      {
        method: body.method,
        number: body.number,
        holderName: body.holderName,
      },
      { new: true },
    ).lean();

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, account });
  } catch (err) {
    console.error("UPDATE WALLET ACCOUNT ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ message: "Missing id" }, { status: 400 });

    await connectDB();
    await WithdrawAccount.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE WALLET ACCOUNT ERROR:", err);
    return NextResponse.json({ success: false });
  }
}
