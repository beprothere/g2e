import RewardsClientUI from "./RewardsClientUI";
import { serverApiFetch } from "@/lib/server-api";

async function getRewardsData() {
  try {
    const response = await serverApiFetch<{
      verifiedLevel1Count: number;
      claimedRewards: any[];
      rewards: any[];
    }>("/api/rewards/overview", {
      method: "GET",
      authCookie: "auth_token",
      next: { revalidate: 30, tags: ["rewards"] },
    });

    if (!response.success || !response.data) return null;

    return {
      verifiedLevel1Count: response.data.verifiedLevel1Count || 0,
      dbRewards: response.data.rewards || [],
      claimedRewards: response.data.claimedRewards || [],
    };
  } catch (err) {
    console.error("Error fetching rewards data:", err);
    return null;
  }
}

export default async function RewardsTiersPage() {
  const data = await getRewardsData();
  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        Access Denied / Error loading data
      </div>
    );

  return (
    <RewardsClientUI
      verifiedLevel1Count={data.verifiedLevel1Count}
      initialClaimedRewards={data.claimedRewards}
      dbRewards={data.dbRewards}
    />
  );
}
