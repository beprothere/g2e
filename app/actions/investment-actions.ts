"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function updateInvestmentStatus(
  transactionId: string,
  action: "approve" | "reject",
) {
  try {
    const response = await serverApiFetch<{
      success?: boolean;
      message?: string;
      status?: string;
    }>("/api/admin/investment-requests", {
      method: "PATCH",
      body: { transactionId, action },
      authCookie: "admin_token",
    });

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        message: response.data?.message || response.error || "Update failed",
      };
    }

    revalidatePath("/admin/investments");
    return {
      success: true,
      message: `Plan ${action === "approve" ? "Approved" : "Rejected"} successfully!`,
    };
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return { success: false, message: error.message };
  }
}
