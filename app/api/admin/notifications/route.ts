import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notifications";

export async function GET() {
  try {
    await connectDB();
    const data = await Notification.find({})
      .select("NotificationType message status isArchieved createdAt userId")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Notifications GET API error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, status, isArchieved } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 },
      );
    }

    const update: Record<string, unknown> = {};
    if (typeof status === "string") update.status = status;
    if (typeof isArchieved === "boolean") update.isArchieved = isArchieved;

    await Notification.findByIdAndUpdate(id, update);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH API error:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { action } = await req.json();

    if (action === "mark-all-read") {
      await Notification.updateMany({ status: "No Read" }, { status: "Read" });
      return NextResponse.json({ success: true });
    }

    if (action === "archive-all") {
      await Notification.updateMany(
        { isArchieved: false },
        { isArchieved: true, status: "Read" },
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Notifications PUT API error:", error);
    return NextResponse.json(
      { success: false, message: "Bulk update failed" },
      { status: 500 },
    );
  }
}
