import { NextResponse } from "next/server";
import InvestmentPlan from "@/models/InvestmentPlan";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const plans = await InvestmentPlan.find().sort({ price: 1 });
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Plans GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load plans" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const plan = await InvestmentPlan.create(body);

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error) {
    console.error("Plans POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create plan" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Plan id is required" },
        { status: 400 },
      );
    }

    const plan = await InvestmentPlan.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Plans PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
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
        { success: false, error: "Plan id is required" },
        { status: 400 },
      );
    }

    const deletedPlan = await InvestmentPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plans DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 },
    );
  }
}
