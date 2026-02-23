"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function confirmSerumOrderAction(serum: any) {
  try {
    const response = await serverApiFetch<{ order?: any; message?: string }>(
      "/api/serum-order",
      {
        method: "POST",
        body: { serum },
        authCookie: "auth_token",
      },
    );

    if (!response.success || !response.data?.order) {
      return {
        error: response.data?.message || response.error || "Failed to confirm order",
      };
    }

    revalidatePath("/dashboard");
    return { order: response.data.order };
  } catch (err: any) {
    return { error: err.message || "Something went wrong" };
  }
}

export async function markAsReceivedAction(orderId: string) {
  try {
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      `/api/serum-order/${encodeURIComponent(orderId)}`,
      {
        method: "PATCH",
        authCookie: "auth_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return { error: response.data?.message || response.error || "Failed to update" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update" };
  }
}
