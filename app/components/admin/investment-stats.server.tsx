import InvestmentStatsClient from "./investment-stats.client";
import { getInvestmentStats } from "@/app/actions/get-investment-stats";

export default async function InvestmentStatsServer() {
  const stats = await getInvestmentStats();

  return (
    <InvestmentStatsClient
      initialStats={
        stats || {
          investorsCount: 0,
          avgInvestmentAmount: 0,
          avgCommissionRate: 0,
          totalInvestedAmount: 0,
          mtdGrowth: 0,
          pendingCount: 0,
          pendingAmount: 0,
        }
      }
    />
  );
}
