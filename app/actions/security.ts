"use server";

import { serverApiFetch } from "@/lib/server-api";

export async function getSecurityStats() {
  try {
    const response = await serverApiFetch<{
      activeThreats: number;
      criticalThreats: number;
      blockedCount: number;
      duplicateIPs: number;
      securityScore: number;
      scoreDetail: string;
      scoreColor: string;
    }>("/api/admin/security/stats", {
      method: "GET",
      authCookie: "admin_token",
    });

    if (!response.success || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Security Stats Error:", error);
    return null;
  }
}
