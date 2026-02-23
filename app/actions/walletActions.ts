"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

type WalletSummaryApi = {
  totalEarning?: number;
  pendingWithdraw?: number;
  availableWithdraw?: number;
};

export async function getWalletDataAction() {
  try {
    const [summaryRes, accountsRes, transactionsRes] = await Promise.all([
      serverApiFetch<WalletSummaryApi>("/api/wallet/summary", {
        method: "GET",
        authCookie: "auth_token",
      }),
      serverApiFetch<{ accounts: any[] }>("/api/wallet/accounts", {
        method: "GET",
        authCookie: "auth_token",
      }),
      serverApiFetch<{ transactions: any[] }>("/api/wallet/transactions", {
        method: "GET",
        authCookie: "auth_token",
      }),
    ]);

    if (!summaryRes.success) {
      return { success: false, error: summaryRes.error || "Unauthorized" };
    }

    return {
      success: true,
      summary: {
        totalEarning: summaryRes.data?.totalEarning || 0,
        pendingWithdraw: summaryRes.data?.pendingWithdraw || 0,
        availableWithdraw: summaryRes.data?.availableWithdraw || 0,
      },
      accounts: accountsRes.data?.accounts || [],
      transactions: transactionsRes.data?.transactions || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch wallet data" };
  }
}

export async function submitWithdrawAction(amount: number, accountId: string) {
  try {
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/wallet/withdraw",
      {
        method: "POST",
        body: { amount, accountId },
        authCookie: "auth_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        error: response.data?.message || response.error || "Withdrawal failed",
      };
    }

    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Withdrawal failed" };
  }
}

export async function saveWithdrawAccountAction(data: any) {
  try {
    const method = data?.accountId ? "PUT" : "POST";
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/wallet/accounts",
      {
        method,
        body: data,
        authCookie: "auth_token",
      },
    );

    if (!response.success) {
      return {
        success: false,
        error: response.data?.message || response.error || "Failed to save account",
      };
    }

    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save account" };
  }
}

export async function makeAccountPrimaryAction(accountId: string) {
  try {
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/wallet/accounts/primary",
      {
        method: "POST",
        body: { accountId },
        authCookie: "auth_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        error: response.data?.message || response.error || "Failed to update primary account",
      };
    }

    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update primary account" };
  }
}

export async function removeAccountAction(accountId: string) {
  try {
    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      `/api/wallet/accounts?id=${encodeURIComponent(accountId)}`,
      {
        method: "DELETE",
        authCookie: "auth_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        error: response.data?.message || response.error || "Failed to remove account",
      };
    }

    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove account" };
  }
}
