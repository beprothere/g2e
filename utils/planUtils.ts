import { PLANS, PlanName } from "@/lib/plans";

export function getPayableAmount(
  currentPlan: PlanName,
  targetPlan: PlanName,
) {
  const currentPrice = PLANS[currentPlan].price;
  const targetPrice = PLANS[targetPlan].price;

  if (targetPrice <= currentPrice) return targetPrice;
  return targetPrice - currentPrice;
}

export function canDowngrade(
  teamCount: number,
  targetPlan: PlanName,
) {
  return teamCount >= PLANS[targetPlan].team;
}
