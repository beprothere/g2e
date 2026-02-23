"use server";

import { serverApiFetch } from "@/lib/server-api";

type BlockedUsersResponse = {
  success: boolean;
  data: Array<{
    _id: string;
    fullName: string;
    email: string;
    avatar: string;
    status: string;
    createdAt: string;
  }>;
};

export async function getBlockedUsers() {
  try {
    const response = await serverApiFetch<BlockedUsersResponse>(
      "/api/admin/users/blocked",
      {
        method: "GET",
        authCookie: "admin_token",
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        error: response.error || "Failed to fetch users",
      };
    }

    return {
      success: true,
      data: response.data.data || [],
    };
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
