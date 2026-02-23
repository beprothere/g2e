"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function getRealtimeWithdrawals(page: number = 1) {
  try {
    const [statsRes, rowsRes] = await Promise.all([
      serverApiFetch<any>("/api/admin/withdrawal-stats", {
        method: "GET",
        authCookie: "admin_token",
        cache: 'no-store',
        next: { revalidate: 0 }
      }),
      serverApiFetch<any>(`/api/admin/withdrawals?page=${page}`, {
        method: "GET",
        authCookie: "admin_token",
        cache: 'no-store',
        next: { revalidate: 0 }
      }),
    ]);

    return {
      stats: statsRes.success ? statsRes.data : null,
      rows: rowsRes.success ? rowsRes.data : null
    };
  } catch (error) {
    console.error("Fetch Withdrawal Error:", error);
    return { stats: null, rows: null };
  }
}

export async function updateWithdrawalStatus(
  id: string,
  action: "approve" | "reject" | "hold",
) {
  try {
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/admin/withdrawals/update",
      {
        method: "PATCH",
        body: { id, action },
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return { success: false, message: response.data?.message || response.error };
    }

    revalidatePath("/admin/withdrawals");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Server connection failed" };
  }
}