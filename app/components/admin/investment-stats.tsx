"use client";

import { useEffect, useState } from "react";
import { Percent, Users, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function InvestmentStats() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/investment-stats", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setStatsData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch investment stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Active Investors",
      value: loading ? "..." : statsData?.investorsCount ?? 0,
      icon: <Users className="h-6 w-6 text-secondary" />,
      bgColor: "bg-secondary/10",
      amount: loading
        ? "Loading..."
        : `Avg: $${statsData?.avgInvestmentAmount.toFixed(2)}`,
    },
    {
      title: "Avg Commission",
      value: loading ? "..." : `${statsData?.avgCommissionRate}%`,
      icon: <Percent className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
      amount: "Across active plans",
    },
    {
      title: "Total Invested",
      value: loading
        ? "..."
        : `$${statsData?.totalInvestedAmount.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      bgColor: "bg-accent/10",
      amount: loading
        ? "Loading..."
        : `MTD Growth: ${statsData?.mtdGrowth}%`,
    },
    {
      title: "Pending Requests",
      value: loading ? "..." : statsData?.pendingCount,
      icon: <Clock className="h-6 w-6 text-destructive" />,
      bgColor: "bg-destructive/10",
      amount: loading
        ? "Loading..."
        : `Total: $${statsData?.pendingAmount.toLocaleString()}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stat.amount}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
