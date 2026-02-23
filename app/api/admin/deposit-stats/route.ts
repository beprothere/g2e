import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const now = new Date();

  /* -------- TODAY RANGE -------- */
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  /* -------- WEEK RANGE -------- */
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  /* -------- 1️⃣ PENDING DEPOSITS -------- */
  const pendingDeposits = await Transaction.aggregate([
    {
      $match: {
        type: "Deposit",
        status: "Pending",
      },
    },
    {
      $group: {
        _id: "$userId",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const pendingCount = pendingDeposits.length;
  const pendingAmount = pendingDeposits.reduce(
    (sum, u) => sum + u.totalAmount,
    0,
  );

  /* -------- 1️⃣ PENDING DEPOSITS -------- */
  const rejectedDeposits = await Transaction.aggregate([
    {
      $match: {
        type: "Deposit",
        status: "Rejected",
      },
    },
    {
      $group: {
        _id: "$userId",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const rejectedCount = rejectedDeposits.length;
  const rejectedAmount = rejectedDeposits.reduce(
    (sum, u) => sum + u.totalAmount,
    0,
  );

  /* -------- 2️⃣ TODAY APPROVED -------- */
  const todayApproved = await Transaction.aggregate([
    {
      $match: {
        type: "Deposit",
        status: "Completed",
        createdAt: { $gte: startOfToday },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const todayApprovedCount = todayApproved.length;
  const todayApprovedAmount = todayApproved.reduce(
    (sum, u) => sum + u.totalAmount,
    0,
  );

  /* -------- 4️⃣ TOTAL THIS WEEK -------- */
  const weekDeposits = await Transaction.aggregate([
    {
      $match: {
        type: "Deposit",
        status: { $in: ["Pending", "Completed"] },
        createdAt: { $gte: startOfWeek },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const weekCount = weekDeposits.length;
  const weekAmount = weekDeposits.reduce((sum, u) => sum + u.totalAmount, 0);

  return NextResponse.json({
    pending: {
      count: pendingCount,
      amount: pendingAmount,
    },
    rejected: {
      count: rejectedCount,
      amount: rejectedAmount,
    },
    todayApproved: {
      count: todayApprovedCount,
      amount: todayApprovedAmount,
    },
    weekTotal: {
      count: weekCount,
      amount: weekAmount,
    },
  });
}
