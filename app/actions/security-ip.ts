"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function getDuplicateIPs() {
  try {
    const response = await serverApiFetch<{
      success: boolean;
      data: any[];
    }>("/api/admin/security/duplicate-ips", {
      method: "GET",
      authCookie: "admin_token",
    });

    if (!response.success || !response.data?.success) {
      return [];
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export async function blockIPUsers(userIds: any) {
  try {
    const response = await serverApiFetch<{ success: boolean }>(
      "/api/admin/security/duplicate-ips",
      {
        method: "PATCH",
        body: { userIds },
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return { success: false };
    }

    revalidatePath("/admin/security"); 
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteIPUsers(userIds: any) {
  try {
    const response = await serverApiFetch<{ success: boolean }>(
      "/api/admin/security/duplicate-ips",
      {
        method: "DELETE",
        body: { userIds },
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return { success: false };
    }

    revalidatePath("/admin/security");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
