export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

function getWeek(date: Date) {
  const day = date.getDate();
  if (day <= 7) return "W1";
  if (day <= 14) return "W2";
  if (day <= 21) return "W3";
  return "W4";
}

export async function GET() {
  try {
    await connectDB();

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const transactions = await Transaction.find({
      status: "Completed",
      createdAt: { $gte: startOfMonth },
    });

    const weeks = {
      W1: { deposits: 0, withdrawals: 0, commissions: 0 },
      W2: { deposits: 0, withdrawals: 0, commissions: 0 },
      W3: { deposits: 0, withdrawals: 0, commissions: 0 },
      W4: { deposits: 0, withdrawals: 0, commissions: 0 },
    };

    transactions.forEach(tx => {
      const week = getWeek(tx.createdAt);

      if (tx.type === "Deposit") {
        weeks[week].deposits += tx.amount;
      }

      if (tx.type === "Withdrawal") {
        weeks[week].withdrawals += Math.abs(tx.amount);
      }

      if (tx.type?.toLowerCase().includes("referral")) {
        weeks[week].commissions += tx.amount;
      }
    });

    const formatted = Object.entries(weeks).map(([week, values]) => ({
      week,
      ...values,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
