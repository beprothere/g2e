"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

const iconMap: any = { Users, TrendingUp };

export default function ReferralStatsCards({
  initialStats,
}: {
  initialStats: any[];
}) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const refreshStats = async () => {
      try {
        const response = await fetch("/api/referral/overview");
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          const raw = resJson.data;

          // Re-calculating exactly like your SSR logic
          const referralTreeSource = raw.referralTree || [];
          const l1Sum = referralTreeSource.reduce(
            (acc: any, curr: any) => acc + Number(curr.earnings || 0),
            0,
          );
          const l2Sum = referralTreeSource.reduce(
            (acc: any, curr: any) =>
              acc +
              (curr.children || []).reduce(
                (childSum: number, child: any) =>
                  childSum + Number(child.earnings || 0),
                0,
              ),
            0,
          );

          setStats([
            {
              label: "Level 1 Referrals",
              value: String(raw.stats?.level1Count || 0),
              earnings: `$${l1Sum.toFixed(2)}`,
              icon: "Users",
            },
            {
              label: "Level 2 Referrals",
              value: String(raw.stats?.level2Count || 0),
              earnings: `$${l2Sum.toFixed(2)}`,
              icon: "TrendingUp",
            },
            {
              label: "Total Earnings",
              value: `$${Number(raw.stats?.totalWithdrawBalance || 0).toFixed(2)}`,
              icon: "Users",
            },
          ]);
        }
      } catch (err) {
        console.error("Stats refresh error:", err);
      }
    };

    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat: any, i: number) => {
        const Icon = iconMap[stat.icon] || Users;
        return (
          <Card key={i} className="glass border-primary/20 p-4 sm:p-6">
            <Icon size={24} className="text-primary mb-3" />
            <p className="text-xs sm:text-sm text-foreground/60 mb-1">
              {stat.label}
            </p>
            <p className="text-xl sm:text-2xl font-bold mb-2">{stat.value}</p>
            <p className="text-xs sm:text-sm text-green-600 font-semibold">
              {stat.earnings} {stat.earnings ? "earned" : ""}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
