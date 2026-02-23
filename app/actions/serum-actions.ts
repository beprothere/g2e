"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function manageSerumAction(
  id: string | null,
  data: any,
  method: "POST" | "PUT" | "DELETE",
) {
  try {
    if (method === "DELETE" && !id) {
      return { success: false, error: "Serum id is required" };
    }

    const endpoint =
      method === "DELETE"
        ? `/api/admin/serums?id=${encodeURIComponent(String(id))}`
        : "/api/admin/serums";

    const body =
      method === "DELETE"
        ? undefined
        : method === "PUT"
          ? { id, ...data }
          : data;

    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      endpoint,
      {
        method,
        body,
        authCookie: "admin_token",
      },
    );

    if (!response.success || response.data?.success === false) {
      return {
        success: false,
        error: response.data?.message || response.error || "Serum operation failed",
      };
    }

    revalidatePath("/admin/serum-order");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
