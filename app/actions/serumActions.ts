"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

interface UpdateOrderParams {
  orderId: string;
  status: string;
  trackingNumber: string;
}

export async function updateSerumOrderAction(params: UpdateOrderParams) {
  try {
    const response = await serverApiFetch<{ order?: any; error?: string }>(
      "/api/admin-panel/serum-orders",
      {
        method: "PUT",
        body: params,
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.order) {
      return {
        success: false,
        error: response.data?.error || response.error || "Order update failed",
      };
    }

    revalidatePath("/admin/serum-order");
    return {
      success: true,
      order: response.data.order,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Order update failed" };
  }
}
