import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MerchantWallet from "@/models/MerchantWallet";

export async function GET() {
  try {
    await connectDB();

    const wallets = await MerchantWallet.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(wallets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      walletName,
      walletAddress,
      provider,
      balance,
      credentials,
    } = body;

    if (!walletName || !walletAddress || !provider) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const wallet = await MerchantWallet.create({
      walletName,
      walletAddress,
      provider,
      balance: Number(balance) || 0,
      status: "active",

      credentials: {
        merchantId: credentials?.merchantId || "",
        storeId: credentials?.storeId || "",
        apiKey: credentials?.apiKey || "",
        apiSecret: credentials?.apiSecret || "",
        sandbox: credentials?.sandbox ?? true,
      },
    });

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create wallet" },
      { status: 500 }
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
      walletAddress,
      balance,
      status,
      provider,
      credentials,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Wallet ID required" },
        { status: 400 }
      );
    }

    const wallet = await MerchantWallet.findByIdAndUpdate(
      id,
      {
        walletName,
        walletAddress,
        balance,
        status,
        provider,

        credentials: {
          merchantId: credentials?.merchantId || "",
          storeId: credentials?.storeId || "",
          apiKey: credentials?.apiKey || "",
          apiSecret: credentials?.apiSecret || "",
          sandbox: credentials?.sandbox ?? true,
        },

        lastTransactionAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update wallet" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    await MerchantWallet.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete wallet" },
      { status: 500 }
    );
  }
}
