import { Clock, CheckCircle, XCircle, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export function WithdrawalStats({ data }: any) {
  const stats = [
    { 
      title: "Pending Withdrawals",
      value: data?.pending?.count || 0,
      amount: `$${(data?.pending?.amount || 0).toLocaleString()}`,
      icon: <Clock className="h-6 w-6 text-accent" />,
      bgColor: "bg-accent/10",
    },
    {
      title: "Today Processed",
      value: data?.todayProcessed?.count || 0,
      amount: `$${(data?.todayProcessed?.amount || 0).toLocaleString()}`,
      icon: <CheckCircle className="h-6 w-6 text-secondary" />,
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Rejected",
      value: data?.rejected?.count || 0,
      amount: `$${(data?.rejected?.amount || 0).toLocaleString()}`,
      icon: <XCircle className="h-6 w-6 text-destructive" />,
      bgColor: "bg-destructive/10",
    },
    {
      title: "Total This Week",
      value: data?.weekTotal?.count || 0,
      amount: `$${(data?.weekTotal?.amount || 0).toLocaleString()}`,
      icon: <TrendingDown className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 rounded-2xl border-none shadow-sm bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stat.amount}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
