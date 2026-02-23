"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TrendingUp, Users, Wallet, Package } from "lucide-react";
import Link from "next/link";
import Serum from "@/components/Serum";
import UserName from "@/components/UserName";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/overview", {
        method: "GET",
        cache: "no-store",
      });
      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
    const interval = setInterval(getDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="space-y-8 pb-10 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-md"></div>
            <div className="h-4 w-64 bg-muted rounded-md"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass border-primary/20 p-4 h-32"></Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-primary/20 p-6 h-64"></Card>
            <Card className="glass border-primary/20 p-6 h-64"></Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, recentReferrals, order, catalogSerum } = data;

  const statsCards = [
    {
      label: "Total Earned",
      value: `$${(stats?.withdrawBalance || 0).toFixed(2)}`,
      icon: Wallet,
      color: "from-primary",
      btn: true,
    },
    {
      label: "Direct Referrals",
      value: (stats?.directReferrals || 0).toString(),
      icon: Users,
      color: "from-secondary",
      btn: false,
    },
    {
      label: "Level 2 Referrals",
      value: (stats?.level2Referrals || 0).toString(),
      icon: TrendingUp,
      color: "from-accent",
      btn: false,
    },
    {
      label: "Pending Deposit",
      value: `$${(stats?.pendingDeposit || 0).toFixed(2)}`,
      icon: Package,
      color: "from-primary",
      btn: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div>
          <UserName />
          <p className="text-muted-foreground font-medium">
            Welcome back! Here's your referral overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card
                key={i}
                className="glass border-primary/20 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-r ${stat.color} to-transparent/20 flex items-center justify-center`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-sm text-foreground/60 font-bold">
                  {stat.label}
                </p>
                <span className="flex items-center justify-between">
                  <p className="text-2xl font-black">{stat.value}</p>
                  {stat.btn && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-2 font-semibold px-4"
                      asChild
                    >
                      <Link href="/wallet">Withdraw</Link>
                    </Button>
                  )}
                </span>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass border-primary/20 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-6 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-lg"
                  asChild
                >
                  <Link href="/referral">View Referral Link</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 bg-transparent border-2 rounded-xl font-semibold"
                  asChild
                >
                  <Link href="/wallet">Withdraw Earnings</Link>
                </Button>
              </div>
            </div>
          </Card>
          <Serum initialOrder={order} catalogData={catalogSerum} />
        </div>

        <Card className="glass border-primary/20 p-6 recent-dah-referal-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase tracking-wider">
              Recent Referrals
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-2 font-bold px-4"
              asChild
            >
              <Link href="/team">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {(!recentReferrals || recentReferrals.length === 0) && (
              <p className="text-sm text-center py-10 text-muted-foreground font-bold">
                No referrals yet.
              </p>
            )}
            {recentReferrals?.map((referral: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{referral.name}</p>
                    <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md uppercase">
                      {referral.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(referral.date).toDateString()}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 font-black text-accent">
                    <p>${referral.earnings}</p>
                    <span className="text-[10px] text-muted-foreground">
                      (Comm: {referral.commissionRate}%)
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${referral.status === "Verified" ? "text-green-600 bg-green-100" : "text-yellow-700 bg-yellow-100"}`}
                  >
                    {referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
