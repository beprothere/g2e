"use client";

import React, { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, DollarSign, AlertCircle, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardKPIs } from "@/app/actions/get-dashboard-kpis"

function KPICard({ title, value, icon, trend, subtitle, bgColor }: any) {
  return (
    <Card className="p-6 rounded-2xl border-none shadow-sm bg-card transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor || 'bg-primary/10'}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-4">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-secondary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-secondary' : 'text-destructive'}`}>
            {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
          </span>
        </div>
      )}
    </Card>
  ) 
}

export function DashboardKPIs() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const result = await getDashboardKPIs();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch KPIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs(); 
    const interval = setInterval(fetchKPIs, 2000); 

    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 rounded-2xl border-none shadow-sm bg-card">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-destructive p-4 text-center">Failed to fetch real-time data.</p>;

  const kpis = [
    {
      title: 'Total Users',
      value: data.totalUsers?.toLocaleString(),
      icon: <Users className="h-6 w-6 text-primary" />,
      trend: data.totalUsersTrend,
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Users',
      value: data.activeUsers?.toLocaleString(),
      icon: <Activity className="h-6 w-6 text-secondary" />,
      trend: data.activeUsersTrend,
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Total Revenue',
      value: `$${data.totalRevenue?.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      trend: data.revenueTrend,
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Pending Withdrawals',
      value: `$${data.pendingWithdrawAmount?.toLocaleString()}`,
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      subtitle: `${data.pendingWithdrawUsers} requests pending approval`,
      bgColor: 'bg-destructive/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  )
}