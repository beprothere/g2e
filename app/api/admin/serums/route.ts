import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Serum from "@/models/Serum";

export async function GET() {
  try {
    await connectDB();
    const serums = await Serum.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, serums });
  } catch (error) {
    console.error("Serums GET API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch serums" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const serum = await Serum.create(body);
    return NextResponse.json({ success: true, serum }, { status: 201 });
  } catch (error: any) {
    console.error("Serums POST API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create serum" },
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
        { success: false, message: "Serum id is required" },
        { status: 400 },
      );
    }

    const { id: _, _id: __, ...updateData } = body;
    const serum = await Serum.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!serum) {
      return NextResponse.json(
        { success: false, message: "Serum not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, serum });
  } catch (error: any) {
    console.error("Serums PUT API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update serum" },
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
        { success: false, message: "Serum id is required" },
        { status: 400 },
      );
    }

    await Serum.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Serums DELETE API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete serum" },
      { status: 500 },
    );
  }
}
