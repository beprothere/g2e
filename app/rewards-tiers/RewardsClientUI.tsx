"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Smartphone,
  Monitor,
  Bike,
  Car,
  Gift,
  Laptop,
  Watch,
  Trophy,
  Clock,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { claimRewardAction } from "@/app/actions/rewards";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const IconMap: Record<string, any> = {
  Smartphone,
  Monitor,
  Bike,
  Car,
  Gift,
  Laptop,
  Watch,
  Trophy,
};

export default function RewardsClientUI({
  verifiedLevel1Count: initialCount,
  initialClaimedRewards,
  dbRewards,
}: any) {
  // --- Same UI Variables ---
  const [verifiedLevel1Count, setVerifiedLevel1Count] = useState(initialCount);
  const [claimedRewards, setClaimedRewards] = useState(initialClaimedRewards);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tiers = dbRewards?.sort((a: any, b: any) => a.level - b.level) || [];
  const claimedIds = claimedRewards?.map((r: any) => r.tierId) || [];

  // --- Realtime Polling (1 second speed) ---
  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const res = await fetch(`/api/rewards/overview?t=${Date.now()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.verifiedLevel1Count !== undefined) {
          setVerifiedLevel1Count(json.verifiedLevel1Count);
          setClaimedRewards(json.claimedRewards || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const interval = setInterval(fetchRealtime, 1000);
    return () => clearInterval(interval);
  }, []);

  const claimReward = async (tierId: string) => {
    setLoadingId(tierId);
    try {
      const result = await claimRewardAction(tierId);
      if (result.success) {
        toast.success("Reward claimed successfully!");
        setClaimedRewards((prev: any) => [
          ...prev,
          { tierId, status: "Processing" },
        ]);
      } else {
        toast.error(result.message || "Failed to claim");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  const activeTier =
    tiers.find((tier: any) => !claimedIds.includes(tier._id.toString())) ||
    tiers[tiers.length - 1];
  const tierTarget = activeTier?.recruits || 0;
  const progressPercent =
    tierTarget > 0 ? (verifiedLevel1Count / tierTarget) * 100 : 0;

  if (!activeTier) return <DashboardLayout>Loading rewards...</DashboardLayout>;

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="min-h-screen bg-background">
          <section className="pb-2 pt-2 md:pt-8 md:pb-2">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Progress
                </h2>
                <p className="text-lg text-foreground/70">
                  Track your journey to the top
                </p>
              </div>

              <Card className="glass border-primary/20 p-8 md:p-12">
                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-sm text-foreground/60 mb-2">
                      Target Tier
                    </p>
                    <h3 className="text-3xl md:text-4xl font-bold mb-2">
                      {activeTier.name}
                    </h3>
                    <p
                      className={`text-sm font-semibold ${activeTier.accentColor} px-3 py-1 rounded-full inline-block`}
                    >
                      Level {activeTier.level}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold">
                        Progress to {activeTier.reward}
                      </span>
                      <span className="text-sm text-foreground/60">
                        {verifiedLevel1Count} / {tierTarget} recruits
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full bg-linear-to-r ${activeTier.color} transition-all duration-500`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <p className="text-sm text-foreground/70">
                        {verifiedLevel1Count >= tierTarget
                          ? "Target reached!"
                          : `${tierTarget - verifiedLevel1Count} more to unlock`}
                      </p>
                      <Button
                        size="lg"
                        disabled={
                          verifiedLevel1Count < tierTarget ||
                          loadingId === activeTier._id ||
                          claimedIds.includes(activeTier._id.toString())
                        }
                        className={`w-fit bg-linear-to-r ${activeTier.color}`}
                        onClick={() => claimReward(activeTier._id)}
                      >
                        {loadingId === activeTier._id
                          ? "Claiming..."
                          : claimedIds.includes(activeTier._id.toString())
                            ? "Claimed"
                            : "Locked"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className={`w-full mt-8 bg-linear-to-r ${activeTier.color}`}
                  asChild
                >
                  <Link href="/referral">Share Your Referral Link</Link>
                </Button>
              </Card>
            </div>
          </section>

          <section className="py-12 md:py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  All Achievement Tiers
                </h2>
              </div>
              <div className="space-y-8">
                {tiers.map((tier: any) => {
                  const isAchieved = verifiedLevel1Count >= tier.recruits;
                  const claimedObj = claimedRewards?.find(
                    (r: any) => r.tierId === tier._id.toString(),
                  );
                  const isClaimed = !!claimedObj;
                  const Icon = IconMap[tier.icon] || Gift;

                  return (
                    <div key={tier._id} className="w-full">
                      <Card
                        className={`glass border-primary/20 p-6 md:p-10 transition-all duration-500 ${isAchieved ? "ring-2 ring-accent" : ""}`}
                      >
                        <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                          <div
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-linear-to-br ${tier.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                          >
                            <Icon size={40} />
                          </div>
                          <div className="grow">
                            <p
                              className={`text-xs font-bold ${tier.accentColor} px-3 py-1 rounded-full w-fit mb-3 mx-auto md:mx-0`}
                            >
                              Level {tier.level}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                              {tier.name}
                            </h3>
                            <p className="text-foreground/70">
                              {tier.description}
                            </p>
                            {isClaimed && (
                              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 items-center">
                                <div className="flex items-center gap-2 text-sm font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-md">
                                  <Clock size={16} />{" "}
                                  {claimedObj.status || "Processing"}
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                      <HelpCircle size={14} /> Tracking Detail
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="p-4 max-w-xs glass border-primary/20 shadow-xl"
                                  >
                                    <p className="font-bold mb-1 text-sm text-primary">
                                      Reward Tracking
                                    </p>
                                    <p className="text-xs mb-3 text-foreground/80">
                                      Your reward is being processed. For any
                                      queries regarding delivery, please contact
                                      our team.
                                    </p>
                                    <Link
                                      href="/get-in-touch"
                                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                                    >
                                      Contact Support →
                                    </Link>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 md:text-right shrink-0">
                            <p className="text-3xl font-bold text-primary">
                              {tier.recruits.toLocaleString()}
                            </p>
                            <p className="text-xl font-bold text-accent">
                              {tier.reward}
                            </p>
                          </div>
                          <div className="shrink-0 w-full md:w-auto">
                            {isClaimed ? (
                              <div className="flex items-center gap-2 text-accent font-bold bg-accent/10 px-6 py-2 rounded-lg justify-center">
                                <Check size={20} /> Claimed
                              </div>
                            ) : isAchieved ? (
                              <Button
                                onClick={() => claimReward(tier._id)}
                                disabled={loadingId === tier._id}
                                className={`w-full bg-linear-to-r ${tier.color}`}
                              >
                                {loadingId === tier._id ? "..." : "Claim Now"}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full"
                                asChild
                              >
                                <Link href="/referral">Start Recruiting</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-12 pb-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-center mb-10">
                Complete Tier Breakdown
              </h2>
              <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-foreground/60">
                        Level
                      </th>
                      <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-foreground/60">
                        Tier Name
                      </th>
                      <th className="text-center py-4 px-6 font-bold uppercase tracking-wider text-foreground/60">
                        Recruits
                      </th>
                      <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-foreground/60">
                        Reward
                      </th>
                      <th className="text-center py-4 px-6 font-bold uppercase tracking-wider text-foreground/60">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier: any) => {
                      const isAchieved = verifiedLevel1Count >= tier.recruits;
                      const claimedObj = claimedRewards?.find(
                        (r: any) => r.tierId === tier._id.toString(),
                      );
                      const isClaimed = !!claimedObj;
                      return (
                        <tr
                          key={tier._id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-primary">
                            Level {tier.level}
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            {tier.name}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {tier.recruits.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 font-bold text-accent">
                            {tier.reward}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {isAchieved ? (
                              isClaimed ? (
                                <span className="text-accent flex items-center justify-center gap-1 font-bold">
                                  <Check size={16} />{" "}
                                  {claimedObj.status || "Claimed"}
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => claimReward(tier._id)}
                                  disabled={loadingId === tier._id}
                                >
                                  {loadingId === tier._id ? "..." : "Claim"}
                                </Button>
                              )
                            ) : (
                              <span className="text-muted-foreground italic">
                                Locked
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
