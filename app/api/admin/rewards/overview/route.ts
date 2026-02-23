import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClaimedReward from "@/models/ClaimedReward";
import { Reward } from "@/models/Reward";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [total, delivered, pending, rejected, rewards] = await Promise.all([
      ClaimedReward.countDocuments({}),
      ClaimedReward.countDocuments({ status: "Received" }),
      ClaimedReward.countDocuments({ status: { $in: ["Processing", "Dispatched"] } }),
      ClaimedReward.countDocuments({ status: "Cancelled" }),
      Reward.find({})
        .sort({ level: 1 })
        .select("name level recruits reward description icon color accentColor")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        delivered,
        pending,
        rejected,
      },
      rewards: rewards.map((item: any) => ({
        _id: item._id?.toString(),
        name: item.name,
        level: item.level,
        recruits: item.recruits,
        reward: item.reward,
        description: item.description,
        icon: item.icon,
        color: item.color,
        accentColor: item.accentColor,
      })),
    });
  } catch (error) {
    console.error("Error fetching rewards overview:", error);
    return NextResponse.json(
      {
        success: false,
        stats: {
          total: 0,
          delivered: 0,
          pending: 0,
          rejected: 0,
        },
        rewards: [],
      },
      { status: 500 },
    );
  }
}
