import { BaseEmail } from "../layout/BaseEmail";
import { InfoList } from "../components/InfoList";

export const planPurchased = (data: Record<string, string>) =>
  BaseEmail("Plan Purchased", InfoList(data));

export const planDowngraded = (data: Record<string, string>) =>
  BaseEmail(
    "Plan Downgraded",
    `
      ${InfoList(data)}
      <p style="color:red">Locked amount discarded as per policy.</p>
    `,
  );

export const planRewardClaimed = (amount: number) =>
  BaseEmail(
    "Plan Reward Claimed",
    `<h2>$${amount} added to your wallet 🎉</h2>`,
  );

export const achievementRewardClaimed = (tier: number) =>
  BaseEmail(
    "Achievement Reward Claimed",
    `<p>You have claimed Level ${tier} rewards 🚀</p>`,
  );
