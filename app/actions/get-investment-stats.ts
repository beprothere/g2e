import { serverApiFetch } from "@/lib/server-api";

export async function getInvestmentStats() {
  try {
    const response = await serverApiFetch<{
      success: boolean;
      data: {
        investorsCount: number;
        avgInvestmentAmount: number;
        avgCommissionRate: number;
        totalInvestedAmount: number;
        mtdGrowth: number;
        pendingCount: number;
        pendingAmount: number;
      };
    }>("/api/admin/investment-stats", {
      method: "GET",
      authCookie: "admin_token",
      next: { revalidate: 30, tags: ["admin-investments"] },
    });

    if (!response.success || !response.data?.success) {
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}
