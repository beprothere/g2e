"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { revalidatePath } from "next/cache";

export async function handleAdjustment(formData: {
  userId: string;
  type: string;
  amount: number;
}) {
  try {
    await connectDB();
    const { userId, type, amount } = formData;

    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };

    let commissionKey = undefined;
    if (type === "Adjustment - Commission") {
      commissionKey = `COMM-${Date.now()}-${userId}`;
    }

    if (type === "Adjustment - Deposit") {
      user.depositBalance += amount;
      user.investedBalance += amount;
    } else if (type === "Adjustment - Withdrawal") {
      user.withdrawBalance += amount;
      user.availableWithdraw += amount;
    } else if (type === "Adjustment - Commission") {
      user.withdrawBalance += amount;
      user.availableWithdraw += amount;
    }

    await user.save();

    await Transaction.create({
      userId,
      type,
      amount,
      status: "Completed",
      commissionKey,
      from: "Admin Manual Adjustment",
    });

    revalidatePath("/admin/wallets");
    return { success: "Balance adjusted successfully" };
  } catch (error: any) {
    return { error: error.message || "Something went wrong" };
  }
}