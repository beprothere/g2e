"use server";

import ManualWallets from "@/models/ManualWallets";
import { connectDB } from "@/lib/db";

export async function getActiveWallets() {
  await connectDB();
  try {
    const wallets = await ManualWallets.find({ status: "active" }).lean();

    return JSON.parse(JSON.stringify(wallets));
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return [];
  }
}
