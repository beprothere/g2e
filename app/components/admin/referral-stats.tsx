import { DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getReferralAnalytics } from "@/lib/referral-logic";

export async function ReferralStats() {
  const data = await getReferralAnalytics();

  const stats = [
    {
      title: "Total Referral Income",
      value: `$${data.totalIncome.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-secondary" />,
      bgColor: "bg-secondary/10",
      change: "Total Commission",
    },
    {
      title: "Active Referrers",
      value: data.activeReferrers.toLocaleString(),
      icon: <Users className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
      change: "Verified Users",
    },
    {
      title: "Avg Chain Depth",
      value: data.avgDepth,
      icon: <TrendingUp className="h-6 w-6 text-accent" />,
      bgColor: "bg-accent/10",
      change: "Level 1 & 2 Avg",
    },
    {
      title: "Suspicious Chains",
      value: data.suspiciousChains.toLocaleString(),
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      bgColor: "bg-destructive/10",
      change: "Unverified/Blocked",
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
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
