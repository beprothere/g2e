import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");
    const dateRange = searchParams.get("dateRange");

    const query: any = {};

    if (search) {
      const normalizedId = search.replace(/^USR-/i, "");
      if (/^[a-fA-F0-9]{24}$/.test(normalizedId)) {
        query._id = normalizedId;
      } else {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (plan && plan !== "all") {
      query.plan = plan;
    }

    if (dateRange && dateRange !== "all") {
      const now = new Date();
      const from = new Date();

      if (dateRange === "7d") from.setUTCDate(now.getUTCDate() - 7);
      if (dateRange === "30d") from.setUTCDate(now.getUTCDate() - 30);
      if (dateRange === "90d") from.setUTCDate(now.getUTCDate() - 90);

      query.createdAt = { $gte: from };
    }

    const listProjection =
      "_id fullName email phone avatar plan status commissionRate address city zipcode country depositBalance withdrawBalance availableWithdraw pendingDeposit createdAt ipAddress accountstatus referralCode";

    const users = await User.find(query)
      .select(listProjection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("USERS API ERROR:", err);
    return NextResponse.json(
      { users: [], total: 0, error: err.message },
      { status: 500 },
    );
  }
}
