import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SerumOrder from "@/models/SerumOrder";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const dateRange = searchParams.get("dateRange") || "all";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const query: any = {};
  if (status !== "all") query.status = status;

  if (search) {
    query.$or = [
      { serumName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (dateRange !== "all") {
    const days = { "7d": 7, "30d": 30, "90d": 90 }[
      dateRange
    ];
    if (days) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      query.createdAt = { $gte: d };
    }
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    SerumOrder.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SerumOrder.countDocuments(query),
  ]);

  return NextResponse.json({
    orders,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
