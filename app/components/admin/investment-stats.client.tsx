"use client";

import { useEffect, useState } from "react";
import { Percent, Users, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

type Stats = {
  investorsCount: number;
  avgInvestmentAmount: number;
  avgCommissionRate: number;
  totalInvestedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  mtdGrowth: number;
};

export default function InvestmentStatsClient({
  initialStats,
}: {
  initialStats: Stats;
}) {
  const [statsData, setStatsData] = useState<Stats>(initialStats);

  useEffect(() => {
    const es = new EventSource("/api/admin/investment-stats/stream");

    es.onmessage = (e) => {
      const data: Stats = JSON.parse(e.data);
      setStatsData(data);
    };

    return () => es.close();
  }, []);

  const stats = [
    {
      title: "Active Investors",
      value: statsData.investorsCount,
      icon: <Users className="h-6 w-6 text-secondary" />,
      bgColor: "bg-secondary/10",
      amount: `Avg: $${statsData.avgInvestmentAmount.toFixed(2)}`,
    },
    {
      title: "Avg Commission",
      value: `${statsData.avgCommissionRate}%`,
      icon: <Percent className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
      amount: "Across active plans",
    },
    {
      title: "Total Invested",
      value: `$${statsData.totalInvestedAmount.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      bgColor: "bg-accent/10",
      amount: `MTD Growth: ${statsData.mtdGrowth}%`,
    },
    {
      title: "Pending Requests",
      value: statsData.pendingCount,
      icon: <Clock className="h-6 w-6 text-destructive" />,
      bgColor: "bg-destructive/10",
      amount: `Total: $${statsData.pendingAmount.toLocaleString()}`,
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
