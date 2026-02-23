import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ManualWallets from "@/models/ManualWallets";

export async function GET() {
  try {
    await connectDB();

    const wallets = await ManualWallets.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(wallets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch wallets" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      walletName,
      provider,
      walletNumber,
      holderName,
      walletTilId,
      signupBalance,
      qrPic,
      balance,
    } = body;

    if (!walletName || !provider || !qrPic) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const wallet = await ManualWallets.create({
      walletName,
      provider,
      walletNumber,
      holderName,
      walletTilId,
      signupBalance: Number(signupBalance) || 0,
      qrPic,
      balance: Number(balance) || 0,
      status: "active",
    });

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create wallet" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      id,
      walletName,
      provider,
      walletNumber,
      holderName,
      walletTilId,
      signupBalance,
      qrPic,
      balance,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Wallet ID required" },
        { status: 400 },
      );
    }

    const wallet = await ManualWallets.findByIdAndUpdate(
      id,
      {
        walletName,
        provider,
        walletNumber,
        holderName,
        walletTilId,
        signupBalance,
        qrPic,
        balance,
        status,
        lastTransactionAt: new Date(),
      },
      { new: true },
    ).lean();

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update wallet" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Wallet ID required" },
        { status: 400 },
      );
    }

    await ManualWallets.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete wallet" },
      { status: 500 },
    );
  }
}
