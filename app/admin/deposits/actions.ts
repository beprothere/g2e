"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function getRealtimeDeposits(page: number = 1) {
  try {
    const [statsRes, depositsRes] = await Promise.all([
      serverApiFetch<any>("/api/admin/deposit-stats", {
        method: "GET",
        authCookie: "admin_token",
        cache: "no-store",
        next: { revalidate: 0 },
      }),
      serverApiFetch<any>(`/api/admin/deposits?page=${page}`, {
        method: "GET",
        authCookie: "admin_token",
        cache: "no-store",
        next: { revalidate: 0 },
      }),
    ]);

    return {
      stats: statsRes.success ? statsRes.data : null,
      deposits: depositsRes.success ? depositsRes.data : null,
    };
  } catch (error) {
    console.error("Fetch Realtime Deposits Error:", error);
    return { stats: null, deposits: null };
  }
}

export async function updateDepositStatus(
  id: string,
  action: "approve" | "reject",
) {
  if (!id || !action) {
    return { success: false, message: "Invalid request data" };
  }

  try {
    const response = await serverApiFetch<{
      success?: boolean;
      message?: string;
    }>("/api/admin/deposits/update", {
      method: "PATCH",
      body: { id, action },
      authCookie: "admin_token",
    });

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        message:
          response.data?.message ||
          response.error ||
          `Failed to ${action} deposit`,
      };
    }

    revalidatePath("/admin/deposits");
    revalidatePath("/admin");
    return {
      success: true,
      message: `Deposit successfully ${action === "approve" ? "approved" : "rejected"}`,
    };
  } catch (error) {
    console.error("Update Action Error:", error);
    return {
      success: false,
      message: "Internal server error. Please try again later.",
    };
  }
}
