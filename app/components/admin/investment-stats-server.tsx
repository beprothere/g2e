"use client";

import useSWR from "swr";
import { Percent, Users, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InvestmentStatsClient() {
  const { data, error, isLoading } = useSWR("/api/admin/investment-stats", fetcher, {
    refreshInterval: 1000, 
    revalidateOnFocus: true,
  });

  if (isLoading) return <StatsSkeleton />;

  if (error || !data?.success) return <div className="text-destructive p-4">Error loading live stats.</div>;

  const statsData = data.data;

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 rounded-2xl border-none shadow-sm bg-card backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.amount}</p>
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

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6 rounded-2xl border-none shadow-sm bg-card animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}