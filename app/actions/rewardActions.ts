"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function getRewards() {
  try {
    const response = await serverApiFetch<{ success: boolean; rewards: any[] }>(
      "/api/admin/rewards",
      {
        method: "GET",
      },
    );

    if (!response.success || !response.data?.success) {
      return [];
    }

    return response.data.rewards || [];
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return [];
  }
}

export async function createReward(formData: any) {
  const response = await serverApiFetch<{ success?: boolean; message?: string }>(
    "/api/admin/rewards",
    {
      method: "POST",
      body: formData,
      authCookie: "admin_token",
    },
  );

  if (!response.success || !response.data?.success) {
    throw new Error(response.data?.message || response.error || "Failed to create reward");
  }

  revalidatePath("/admin/rewards");
}

export async function updateReward(id: string, formData: any) {
  const response = await serverApiFetch<{ success?: boolean; message?: string }>(
    "/api/admin/rewards",
    {
      method: "PUT",
      body: { ...formData, id },
      authCookie: "admin_token",
    },
  );

  if (!response.success || !response.data?.success) {
    throw new Error(response.data?.message || response.error || "Failed to update reward");
  }

  revalidatePath("/admin/rewards");
}

export async function deleteReward(id: string) {
  const response = await serverApiFetch<{ success?: boolean; message?: string }>(
    `/api/admin/rewards?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      authCookie: "admin_token",
    },
  );

  if (!response.success || !response.data?.success) {
    throw new Error(response.data?.message || response.error || "Failed to delete reward");
  }

  revalidatePath("/admin/rewards");
}

export async function getClaimedRewardsWithUsers() {
  try {
    const response = await serverApiFetch<{
      success: boolean;
      items: any[];
      total: number;
    }>("/api/admin/reward-claims?page=1&limit=25", {
      method: "GET",
      authCookie: "admin_token",
    });

    if (!response.success || !response.data?.success) {
      return [];
    }

    return response.data.items || [];
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export async function updateRewardClaimStatus(
  id: string,
  status: string,
  tracking: string,
) {
  try {
    const response = await serverApiFetch<{ success?: boolean; error?: string }>(
      `/api/admin/reward-claims/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: { status, trackingNumber: tracking },
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        error: response.data?.error || response.error || "Update failed",
      };
    }

    revalidatePath("/admin/rewards");
    return { success: true };
  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error);
    return { success: false, error: error.message };
  }
}
