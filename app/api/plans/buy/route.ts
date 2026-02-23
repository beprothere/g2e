import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import PlanTransaction from "@/models/PlanTransaction";
import InvestmentPlan from "@/models/InvestmentPlan";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sendMail } from "@/app/lib/mail/sendMail";
import { sendPush } from "@/lib/notifier";
import crypto from "crypto";

export async function POST(req: Request) {
  await connectDB();
  const { targetPlan, method, tid, receiptImage } = await req.json();

  const token = (await cookies()).get("auth_token")?.value;
  if (!token)
    return Response.json({ message: "Unauthorized" }, { status: 401 });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await User.findById(decoded.id);
  if (!user)
    return Response.json({ message: "User not found" }, { status: 404 });

  if (!["jazzcash", "easypaisa"].includes(method))
    return Response.json({ message: "Invalid method" }, { status: 400 });

  if (!tid || !receiptImage)
    return Response.json(
      { message: "Transaction ID and Receipt required" },
      { status: 400 },
    );

  const planDoc = await InvestmentPlan.findOne({ name: targetPlan });
  if (!planDoc)
    return Response.json({ message: "Plan not found" }, { status: 404 });

  const uniqueParse = `PLN-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${Date.now()}`;

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + (planDoc.durationDays || 30));

  user.plan = planDoc.name;
  user.planPrice = planDoc.price;
  user.commissionRate = planDoc.commission;
  user.planStatus = "Pending";
  user.planStartDate = now;
  user.planEndDate = endDate;
  user.planDurationDays = planDoc.durationDays || 30;
  user.hasClaimed = false;
  user.isPaid = true;

  await user.save();

  await PlanTransaction.create({
    userId: user._id,
    fromPlan: user.plan,
    toPlan: planDoc.name,
    paidAmount: planDoc.price,
    method,
    tid,
    receiptImage,
    durationDays: planDoc.durationDays || 30,
    planCommission: planDoc.commission,
    planStatus: "Pending",
    planUniqueParse: uniqueParse,
  });

  await Transaction.create({
    userId: user._id,
    type: "Plan Purchase",
    amount: planDoc.price,
    status: "Pending",
    method,
    tid,
    receiptImage,
    planUniqueParse: uniqueParse,
  });

  sendPush(
    user._id.toString(),
    "Plan Purchase Submitted",
    `Your ${targetPlan} plan request is submitted.`,
    "/dashboard",
  );

  await sendMail(
    user.email,
    "Plan Purchase Submitted",
    `<p>Your ${targetPlan} plan request has been submitted.</p>`,
    "update",
  );

  return Response.json({ success: true });
}
