import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClaimedReward from "@/models/ClaimedReward";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(searchParams.get("limit") || "5");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 25)
        : 5;
    const skip = (page - 1) * limit;

    await connectDB();

    const [total, claims] = await Promise.all([
      ClaimedReward.countDocuments({}),
      ClaimedReward.find({})
        .select("userId rewardName level status trackingNumber claimedAt")
        .populate({
          path: "userId",
          select: "fullName email",
          model: User,
        })
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const items = claims.map((claim: any) => ({
      _id: claim._id?.toString(),
      rewardName: claim.rewardName,
      level: claim.level,
      status: claim.status,
      trackingNumber: claim.trackingNumber || "",
      claimedAt: claim.claimedAt,
      userName: claim.userId?.fullName || "Unknown User",
      userEmail: claim.userId?.email || "No Email",
    }));

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      items,
    });
  } catch (error) {
    console.error("Error fetching paginated reward claims:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reward claims" },
      { status: 500 },
    );
  }
}
