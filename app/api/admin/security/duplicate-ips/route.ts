import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import DeletedUser from "@/models/DeletedUser";

export async function GET() {
  try {
    await connectDB();

    const duplicates = await User.aggregate([
      {
        $match: { ipAddress: { $ne: null, $exists: true } },
      },
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          users: {
            $push: { id: "$_id", name: "$fullName", status: "$status" },
          },
          firstSeen: { $min: "$createdAt" },
          lastSeen: { $max: "$createdAt" },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const data = duplicates.map((item) => ({
      ip: item._id,
      signups: item.count,
      users: item.users.map((u: any) => u.name),
      userIds: item.users.map((u: any) => u.id.toString()),
      firstSeen: new Date(item.firstSeen).toLocaleDateString(),
      lastSeen: new Date(item.lastSeen).toLocaleDateString(),
      status: item.users.every((u: any) => u.status === "Blocked")
        ? "blocked"
        : "active",
      risk: item.count > 5 ? "high" : item.count > 2 ? "medium" : "low",
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Duplicate IP API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch duplicate IPs" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "userIds are required" },
        { status: 400 },
      );
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: "Blocked", accountstatus: "Deactivated" } },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Block duplicate IP users API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to block users" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "userIds are required" },
        { status: 400 },
      );
    }

    const usersToDelete = await User.find({ _id: { $in: userIds } });
    const deletedEntries = usersToDelete.map((user) => ({
      originalUserId: user._id,
      data: user.toObject(),
    }));

    await DeletedUser.insertMany(deletedEntries);
    await User.deleteMany({ _id: { $in: userIds } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete duplicate IP users API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete users" },
      { status: 500 },
    );
  }
}
