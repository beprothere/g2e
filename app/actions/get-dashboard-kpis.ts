"use server";

import { serverApiFetch } from "@/lib/server-api";
interface KPIData {
  totalUsers: number;
  totalUsersTrend: { value: number; isPositive: boolean };
  activeUsers: number;
  activeUsersTrend: { value: number; isPositive: boolean };
  totalRevenue: number;
  revenueTrend: { value: number; isPositive: boolean };
  pendingWithdrawAmount: number;
  pendingWithdrawUsers: number;
}

export async function getDashboardKPIs() {
  try {
    const response = await serverApiFetch<KPIData>("/api/admin/dashboard/kpis", {
      method: "GET",
      authCookie: "admin_token",
      next: { 
        revalidate: 20, 
        tags: ["admin-dashboard"] 
      },
    });

    if (!response.success || !response.data) {
      console.error("Dashboard KPI Fetch Unsuccessful:", response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Dashboard KPI Error:", error);
    return null;
  }
}