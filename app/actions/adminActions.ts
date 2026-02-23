"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function updateTrxStatus(trxId: string, status: string, userId: string) {
  try {
    const response = await serverApiFetch<{ success: boolean; message?: string; error?: string }>(
      "/api/admin-panel/transactions/update",
      {
        method: "PATCH",
        body: { trxId, status, userId },
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return { error: response.data?.error || response.error || "Something went wrong" };
    }

    revalidatePath(`/admin/users/${userId}`);
    return { success: response.data.message || `Transaction marked as ${status}` };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function updateSerumOrderAction(orderId: string, status: string, trackingNumber: string, userId: string) {
  try {
    const response = await serverApiFetch<{ order?: any; error?: string }>(
      "/api/admin-panel/serum-orders",
      {
        method: "PUT",
        body: { orderId, status, trackingNumber },
        authCookie: "admin_token",
      },
    );

    if (!response.success) {
      return { error: response.data?.error || response.error || "Failed to update order" };
    }

    revalidatePath(`/admin/users/${userId}`);
    return { success: "Order updated successfully" };
  } catch {
    return { error: "Failed to update order" };
  }
}
