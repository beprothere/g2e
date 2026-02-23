"use server";

import { serverApiFetch } from "@/lib/server-api";

export async function getDashboardChartsData() {
  const fallback = { userGrowthData: [], revenueData: [] };

  try {
    const [userGrowthRes, revenueRes] = await Promise.all([
      serverApiFetch<any[]>("/api/admin/dashboard/user-growth", {
        method: "GET",
        authCookie: "admin_token",
        next: { revalidate: 0, tags: ["admin-dashboard"] },
        cache: "no-store", 
      }),
      serverApiFetch<any[]>("/api/admin/dashboard/revenue-overview", {
        method: "GET",
        authCookie: "admin_token",
        next: { revalidate: 0, tags: ["admin-dashboard"] },
        cache: "no-store",
      }),
    ]);

    return {
      userGrowthData: userGrowthRes.success ? (userGrowthRes.data || []) : [],
      revenueData: revenueRes.success ? (revenueRes.data || []) : [],
    };
  } catch (error) {
    console.error("Dashboard charts error:", error);
    return fallback;
  }
}