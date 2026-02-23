import { NextResponse, userAgent } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendPush } from "@/lib/notifier";
import { sendMail } from "@/app/lib/mail/sendMail";
import { sendAccountVerifyAlert } from "@/app/lib/mail/templates/security";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { device, os, browser } = userAgent(req);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "Unknown";

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB");
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "id and action are required" },
        { status: 400 },
      );
    }

    const depositTx: any = await Transaction.findById(id);
    if (!depositTx) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 },
      );
    }

    if (depositTx.status !== "Pending") {
      return NextResponse.json(
        { success: false, message: "Transaction already processed" },
        { status: 400 },
      );
    }

    const amount = Number(depositTx.amount || 0);
    const userId = depositTx.userId;
    const user: any = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (action === "reject") {
      await Transaction.findByIdAndUpdate(id, { status: "Rejected" });
      await User.findByIdAndUpdate(userId, {
        $inc: { pendingDeposit: -amount },
      });

      await sendPush(
        user._id,
        "Deposit Rejected",
        `Your deposit of $${amount} has been rejected.`,
        "/deposit-topup",
      ).catch((e) => {});
      return NextResponse.json({ success: true });
    }

    const isFirstDeposit = user.isPaid === false;

    await User.findByIdAndUpdate(userId, {
      $inc: {
        depositBalance: amount,
        investedBalance: amount,
        pendingDeposit: -amount,
      },
      status: "Verified",
      isPaid: true,
    });

    depositTx.status = "Completed";
    await depositTx.save();

    if (isFirstDeposit) {
      const deviceString = device.model
        ? `${device.vendor || ""} ${device.model}`.trim()
        : "Desktop";
      const osString = `${os.name || "Unknown OS"} ${os.version || ""}`.trim();
      const browserString =
        `${browser.name || "Unknown Browser"} ${browser.version || ""}`.trim();
      try {
        await sendMail(
          user.email,
          `Account Verified - ${formattedDate}`,
          sendAccountVerifyAlert({
            device: deviceString,
            os: osString,
            browser: browserString,
            ip,
            time: `${formattedDate} ${formattedTime}`,
          }),
          "security",
        );
      } catch (e) {
        console.error("Mail error:", e);
      }
    }

    if (user.referBy) {
      const l1Referrer: any = await User.findOne({
        referralCode: user.referBy,
      });

      if (l1Referrer) {
        const l1Key = `L1-DEP-${id}`;
        const existingL1 = await Transaction.findOne({ commissionKey: l1Key });

        if (!existingL1) {
          const l1Rate = l1Referrer.commissionRate || 0;
          const l1Commission = (amount * l1Rate) / 100;

          if (l1Commission > 0) {
            await User.findByIdAndUpdate(l1Referrer._id, {
              $inc: {
                availableWithdraw: l1Commission,
                withdrawBalance: l1Commission,
              },
            });

            await Transaction.create({
              userId: l1Referrer._id,
              type: "Level 1 Referral",
              amount: l1Commission,
              comisionrate: l1Rate,
              status: "Completed",
              from: user.fullName,
              commissionKey: l1Key,
            });

            await sendPush(
              l1Referrer._id,
              "Level 1 Commission",
              `Received $${l1Commission} from ${user.fullName}`,
              "/deposit-topup",
            ).catch(() => {});
          }
        }

        if (l1Referrer.referBy) {
          const l2Referrer: any = await User.findOne({
            referralCode: l1Referrer.referBy,
          });

          if (l2Referrer) {
            const l2Key = `L2-DEP-${id}`;
            const existingL2 = await Transaction.findOne({
              commissionKey: l2Key,
            });

            if (!existingL2) {
              const l2Commission = (amount * 5) / 100;

              if (l2Commission > 0) {
                await User.findByIdAndUpdate(l2Referrer._id, {
                  $inc: {
                    availableWithdraw: l2Commission,
                    withdrawBalance: l2Commission,
                  },
                });

                await Transaction.create({
                  userId: l2Referrer._id,
                  type: "Level 2 Referral",
                  amount: l2Commission,
                  status: "Completed",
                  comisionrate: 5,
                  from: user.fullName,
                  commissionKey: l2Key,
                });

                await sendPush(
                  l2Referrer._id,
                  "Level 2 Commission",
                  `Received $${l2Commission} from ${user.fullName}`,
                  "/deposit-topup",
                ).catch(() => {});
              }
            }
          }
        }
      }
    }

    await sendPush(
      user._id,
      "Deposit Approved",
      `Your deposit of $${amount} has been approved.`,
      "/deposit-topup",
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Deposit update API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Update failed" },
      { status: 500 },
    );
  }
}
