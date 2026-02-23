export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const data = await User.aggregate([
      {
        $match: { createdAt: { $gte: startOfYear } },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          users: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ["$status", "Verified"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

    const formatted = months.map((month, index) => {
      const found = data.find(d => d._id === index + 1);
      return {
        month,
        users: found?.users || 0,
        active: found?.active || 0,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
