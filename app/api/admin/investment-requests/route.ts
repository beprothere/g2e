import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PlanTransaction from "@/models/PlanTransaction";
import User from "@/models/User";
import InvestmentPlan from "@/models/InvestmentPlan";
import Transaction from "@/models/Transaction";
import { sendPush } from "@/lib/notifier";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page") || 1);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limitParam = Number(searchParams.get("limit") || 10);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 50)
        : 10;
    const skip = (page - 1) * limit;

    const [total, transactions] = await Promise.all([
      PlanTransaction.countDocuments(),
      PlanTransaction.find()
        .select("userId toPlan method durationDays receiptImage tid paidAmount planCommission planStatus createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    if (transactions.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const userIds = [...new Set(transactions.map((t: any) => t.userId?.toString()))];
    const planNames = [...new Set(transactions.map((t: any) => t.toPlan))];

    const [users, plans] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select("fullName email accountstatus commissionRate")
        .lean(),
      InvestmentPlan.find({ name: { $in: planNames } })
        .select("name refsRequired roi")
        .lean(),
    ]);

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const planMap = new Map(plans.map((p: any) => [p.name, p]));

    const data = transactions.map((tx) => {
      const user = userMap.get(tx.userId.toString());
      const plan = planMap.get(tx.toPlan);

      return {
        id: tx._id.toString(),
        userId: tx.userId.toString(),
        userName: user?.fullName || "Unknown",
        plan: tx.toPlan,
        amount: tx.paidAmount,
        duration: tx.durationDays,
        receipt: tx.receiptImage,
        tId: tx.tid,
        method: tx.method,
        refsRequired: plan?.refsRequired || 0,
        commission: tx.planCommission,
        status: tx.planStatus, 
        date: tx.createdAt,
        roiPercentage: plan?.roi || 0,
        user,
        transaction: tx,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("Investment requests GET error:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { transactionId, action } = await req.json();

    if (!transactionId || !action) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { success: false, message: "Action must be approve or reject" },
        { status: 400 },
      );
    }

    const transaction = await PlanTransaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    const uniqueId = transaction.planUniqueParse;
    if (!uniqueId) {
      return NextResponse.json(
        { success: false, message: "Unique plan transaction id missing" },
        { status: 400 },
      );
    }

    const userId = transaction.userId;
    const planName = transaction.toPlan;

    if (action === "approve") {
      transaction.planStatus = "In Progress";

      await Promise.all([
        User.findByIdAndUpdate(userId, {
          planStatus: "In Progress",
          plan: transaction.toPlan,
          planPrice: transaction.paidAmount,
          commissionRate: transaction.planCommission,
          isPaid: transaction.toPlan !== "Free",
        }),
        Transaction.findOneAndUpdate(
          { planUniqueParse: uniqueId },
          { $set: { status: "Completed" } },
          { new: true },
        ),
      ]);

      sendPush(
        userId,
        "Plan Approved",
        `Congratulations! Your ${planName} plan has been approved.`,
        "/investor-plans",
      ).catch((e) => console.error(e));
    }

    if (action === "reject") {
      transaction.planStatus = "Rejected";

      await Promise.all([
        User.findByIdAndUpdate(userId, {
          planStatus: "Rejected",
        }),
        Transaction.findOneAndUpdate(
          { planUniqueParse: uniqueId },
          { $set: { status: "Rejected" } },
          { new: true },
        ),
      ]);

      sendPush(
        userId,
        "Plan Request Rejected",
        `Your request for ${planName} plan was rejected.`,
        "/investor-plans",
      ).catch((e) => console.error(e));
    }

    await transaction.save();

    return NextResponse.json({
      success: true,
      status: transaction.planStatus,
    });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

