import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Reward } from "@/models/Reward";

export async function GET() {
  try {
    await connectDB();
    const rewards = await Reward.find({}).sort({ level: 1 }).lean();
    return NextResponse.json({ success: true, rewards });
  } catch (error) {
    console.error("Rewards GET API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rewards" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const reward = await Reward.create(body);
    return NextResponse.json({ success: true, reward }, { status: 201 });
  } catch (error: any) {
    console.error("Rewards POST API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create reward" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || body._id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Reward id is required" },
        { status: 400 },
      );
    }

    const { id: _, _id: __, ...updateData } = body;
    const reward = await Reward.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!reward) {
      return NextResponse.json(
        { success: false, message: "Reward not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, reward });
  } catch (error: any) {
    console.error("Rewards PUT API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update reward" },
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
        { success: false, message: "Reward id is required" },
        { status: 400 },
      );
    }

    await Reward.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rewards DELETE API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete reward" },
      { status: 500 },
    );
  }
}
