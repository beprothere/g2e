"use server";

import { serverApiFetch } from "@/lib/server-api";

export async function getProfileStatus() {
  try {
    const response = await serverApiFetch<{
      user: any | null;
      incompleteFields?: string[];
    }>("/api/auth/me", {
      method: "GET",
      authCookie: "auth_token",
    });

    if (!response.success || !response.data?.user) {
      return { show: false, missing: [] };
    }

    const missing = response.data.incompleteFields || [];
    return {
      show: missing.length > 0,
      missing,
    };
  } catch {
    return { show: false, missing: [] };
  }
}
