import RewardClientPage from "./RewardClientPage";
export default function RewardsPage() {
  const emptyStats = {
    total: 0,
    delivered: 0,
    pending: 0,
    rejected: 0,
  };

  return (
    <div className="pb-20">
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
          Manage Referral Rewards
        </h1>
        <p className="text-muted-foreground mb-10">
          Create, edit, or delete your referral reward tiers below.
        </p>
      </section>

      <RewardClientPage
        initialRewards={[]}
        stats={emptyStats}
        plainClaims={[]}
        initialClaimsTotal={0}
        loadOverviewOnClient
      />
    </div>
  );
}
