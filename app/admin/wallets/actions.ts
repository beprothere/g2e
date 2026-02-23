"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function handleWalletAction(
  data: any,
  method: "POST" | "PUT" | "DELETE",
) {
  try {
    if (method === "POST") {
      const res = await serverApiFetch<{ wallet?: any; message?: string }>(
        "/api/admin/merchant-wallets",
        {
          method: "POST",
          body: data,
          authCookie: "admin_token",
        },
      );

      if (!res.success) {
        return { success: false, error: res.data?.message || res.error };
      }
    }

    if (method === "PUT") {
      const payload = { ...data, id: data._id };
      const res = await serverApiFetch<{ wallet?: any; message?: string }>(
        "/api/admin/merchant-wallets",
        {
          method: "PUT",
          body: payload,
          authCookie: "admin_token",
        },
      );

      if (!res.success) {
        return { success: false, error: res.data?.message || res.error };
      }
    }

    if (method === "DELETE") {
      const res = await serverApiFetch<{ success?: boolean; message?: string }>(
        `/api/admin/merchant-wallets?id=${encodeURIComponent(data.id)}`,
        {
          method: "DELETE",
          authCookie: "admin_token",
        },
      );

      if (!res.success || !res.data?.success) {
        return { success: false, error: res.data?.message || res.error };
      }
    }

    revalidatePath("/admin/wallets");
    return { success: true };
  } catch (error) {
    console.error("Wallet Action Error:", error);
    return { success: false, error: "Database operation failed" };
  }
}

export async function handleManualWalletAction(
  data: any,
  method: "POST" | "PUT" | "DELETE",
) {
  try {
    if (method === "POST") {
      const res = await serverApiFetch<{ wallet?: any; message?: string }>(
        "/api/admin/manual-wallets",
        {
          method: "POST",
          body: data,
          authCookie: "admin_token",
        },
      );

      if (!res.success) {
        return { success: false, error: res.data?.message || res.error };
      }
    }

    if (method === "PUT") {
      const payload = { ...data, id: data._id };
      const res = await serverApiFetch<{ wallet?: any; message?: string }>(
        "/api/admin/manual-wallets",
        {
          method: "PUT",
          body: payload,
          authCookie: "admin_token",
        },
      );

      if (!res.success) {
        return { success: false, error: res.data?.message || res.error };
      }
    }

    if (method === "DELETE") {
      const res = await serverApiFetch<{ success?: boolean; message?: string }>(
        `/api/admin/manual-wallets?id=${encodeURIComponent(data.id)}`,
        {
          method: "DELETE",
          authCookie: "admin_token",
        },
      );

      if (!res.success || !res.data?.success) {
        return { success: false, error: res.data?.message || res.error };
      }
    }

    revalidatePath("/admin/wallets");
    return { success: true };
  } catch (error) {
    console.error("Wallet Action Error:", error);
    return { success: false, error: "Database operation failed" };
  }
}

export async function handleAdjustment(
  amount: number,
  type: "Deposit" | "Withdrawal",
) {
  try {
    const res = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/admin/transactions",
      {
        method: "POST",
        body: { amount, type },
        authCookie: "admin_token",
      },
    );

    if (!res.success || !res.data?.success) {
      return { success: false, error: res.data?.message || res.error || "Adjustment failed" };
    }

    revalidatePath("/admin/wallets");
    return { success: true };
  } catch (error) {
    console.error("Adjustment Action Error:", error);
    return { success: false, error: "Adjustment failed" };
  }
}

export async function updateTransactionStatus(
  id: string,
  action: "approve" | "reject",
) {
  try {
    const res = await serverApiFetch<{ success?: boolean; error?: string }>(
      `/api/admin/transactions/${id}`,
      {
        method: "PATCH",
        body: { action },
        authCookie: "admin_token",
      },
    );

    if (!res.success || !res.data?.success) {
      return { success: false, error: res.data?.error || res.error };
    }

    revalidatePath("/admin/wallets");
    return { success: true };
  } catch (error) {
    console.error("Transaction Action Error:", error);
    return { success: false };
  }
}
