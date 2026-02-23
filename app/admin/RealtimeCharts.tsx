"use client";

import { useState, useEffect } from "react";
import { getDashboardChartsData } from "@/app/actions/get-dashboard-charts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCharts } from "../components/admin/dashboard-charts";

export function RealtimeCharts() {
  const [data, setData] = useState<{userGrowthData: any[], revenueData: any[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      const result = await getDashboardChartsData();
      if (result) {
        setData(result);
        setLoading(false);
      }
    };

    fetchCharts(); 
    const interval = setInterval(fetchCharts, 3000); 

    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Card className="p-6 border-none shadow-sm bg-card">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-75 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <DashboardCharts
      userGrowthData={data?.userGrowthData || []}
      revenueData={data?.revenueData || []}
    />
  );
}