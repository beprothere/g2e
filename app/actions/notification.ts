"use server";

import { serverApiFetch } from "@/lib/server-api";

export async function getNotifications() {
  try {
    const response = await serverApiFetch<{ success: boolean; data: any[] }>(
      "/api/admin/notifications",
      {
        method: "GET",
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return [];
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function updateNotificationStatus(id: string, status: string = "Read") {
  await serverApiFetch<{ success?: boolean }>("/api/admin/notifications", {
    method: "PATCH",
    body: { id, status },
    authCookie: "admin_token",
  });
}

export async function archiveNotification(id: string) {
  await serverApiFetch<{ success?: boolean }>("/api/admin/notifications", {
    method: "PATCH",
    body: { id, isArchieved: true, status: "Read" },
    authCookie: "admin_token",
  });
}

export async function markAllAsRead() {
  await serverApiFetch<{ success?: boolean }>("/api/admin/notifications", {
    method: "PUT",
    body: { action: "mark-all-read" },
    authCookie: "admin_token",
  });
}

export async function archiveAllNotifications() {
  await serverApiFetch<{ success?: boolean }>("/api/admin/notifications", {
    method: "PUT",
    body: { action: "archive-all" },
    authCookie: "admin_token",
  });
}
