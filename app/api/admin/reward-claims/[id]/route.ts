import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClaimedReward from "@/models/ClaimedReward";
import { sendPush } from "@/lib/notifier";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { status, trackingNumber } = await req.json();

    const claim: any = await ClaimedReward.findById(id);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: "Record not found" },
        { status: 404 },
      );
    }

    const oldStatus = claim.status;
    const oldTracking = claim.trackingNumber;

    if (typeof status === "string" && status.trim()) {
      claim.status = status;
    }
    if (typeof trackingNumber === "string") {
      claim.trackingNumber = trackingNumber;
    }

    await claim.save({ validateBeforeSave: false });

    let shouldNotify = false;
    let title = "";
    let body = "";

    if (oldStatus !== claim.status) {
      shouldNotify = true;
      if (claim.status === "Dispatched") {
        title = "Reward Shipped";
        body = `Your reward "${claim.rewardName}" is on the way.${claim.trackingNumber ? ` Tracking: ${claim.trackingNumber}` : ""}`;
      } else if (claim.status === "Received") {
        title = "Reward Delivered";
        body = `Your reward "${claim.rewardName}" has been delivered.`;
      } else {
        title = "Reward Status Updated";
        body = `Your reward "${claim.rewardName}" is now ${claim.status}.`;
      }
    } else if (oldTracking !== claim.trackingNumber && claim.trackingNumber) {
      shouldNotify = true;
      title = "Tracking Updated";
      body = `Tracking number for "${claim.rewardName}" is now ${claim.trackingNumber}.`;
    }

    if (shouldNotify) {
      sendPush(claim.userId.toString(), title, body, "/rewards").catch((e) =>
        console.error("Reward claim push error:", e),
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reward claim PATCH API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 },
    );
  }
}
