"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function claimRewardAction(tierId: string) {
  try {
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/rewards/claim",
      {
        method: "POST",
        body: { tierId },
        authCookie: "auth_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        message: response.data?.message || response.error || "Failed to claim reward",
      };
    }

    revalidatePath("/rewards-tiers");
    revalidatePath("/rewards");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
