"use client";

import { Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

type DepositStatsData = {
  pending: { count: number; amount: number };
  rejected: { count: number; amount: number };
  todayApproved: { count: number; amount: number };
  weekTotal: { count: number; amount: number };
};
 
export function DepositStats({
  initialData,
}: {
  initialData: DepositStatsData;
}) {
  const data = initialData;

  const stats = [
    {
      title: "Pending Deposits",
      value: data.pending.count,
      amount: `$${data.pending.amount.toLocaleString()}`,
      icon: <Clock className="h-6 w-6 text-accent" />,
      bgColor: "bg-accent/10",
    },
    {
      title: "Today Approved",
      value: data.todayApproved.count,
      amount: `$${data.todayApproved.amount.toLocaleString()}`,
      icon: <CheckCircle className="h-6 w-6 text-secondary" />,
      bgColor: "bg-secondary/10",
    },
    {
      title: "Rejected Deposit",
      value: data.rejected.count,
      amount: `$${data.rejected.amount.toLocaleString()}`,
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      bgColor: "bg-destructive/10",
    },
    {
      title: "Total This Week",
      value: data.weekTotal.count,
      amount: `$${data.weekTotal.amount.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
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
