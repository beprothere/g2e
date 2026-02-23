"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

type PlanMutationResponse = {
  success: boolean;
  plan?: unknown;
};

export async function savePlanAction(formData: any, isNew: boolean) {
  try {
    if (!isNew && !formData?._id) {
      return { success: false, error: "Plan id is required" };
    }

    const payload = isNew
      ? formData
      : (() => {
          const { _id, ...updateData } = formData;
          return { id: _id, ...updateData };
        })();

    const response = await serverApiFetch<PlanMutationResponse>(
      "/api/admin/plans",
      {
        method: isNew ? "POST" : "PUT",
        body: payload,
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return { success: false, error: response.error || "Failed to save plan" };
    }

    revalidatePath("/admin/investments");
    return { success: true, data: response.data.plan };
  } catch {
    return { success: false };
  }
}

export async function deletePlanAction(id: string) {
  try {
    const response = await serverApiFetch<{ success: boolean }>(
      `/api/admin/plans?id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        error: response.error || "Failed to delete plan",
      };
    }

    revalidatePath("/admin/investments");
    return { success: true };
  } catch {
    return { success: false };
  }
}
