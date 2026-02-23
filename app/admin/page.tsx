import { DashboardCharts } from "../components/admin/dashboard-charts";
import { AlertsCard } from "../components/admin/alerts-card";
import { DashboardKPIs } from "../components/admin/dashboard-kpis";
import { getDashboardChartsData } from "@/app/actions/get-dashboard-charts";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RealtimeCharts } from "./RealtimeCharts";

function KPIsFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {["Users", "Revenue", "Deposits", "Withdrawals"].map((label) => (
        <Card key={label} className="p-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Skeleton className="h-8 w-24 mt-3" />
          <Skeleton className="h-3 w-20 mt-3" />
        </Card>
      ))}
    </div>
  );
}

function ChartsFallback() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Overview</h3>
          <p className="text-sm text-muted-foreground">
            Revenue and growth trends
          </p>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="mt-6 space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </Card>
  );
}

async function ChartsWrapper() {
  const chartData = await getDashboardChartsData();
  return (
    <DashboardCharts
      userGrowthData={chartData.userGrowthData}
      revenueData={chartData.revenueData}
    />
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Admin. Here's your business overview.
        </p>
      </div>

      <Suspense
        fallback={<KPIsFallback />}
      >
        <DashboardKPIs />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense
            fallback={<ChartsFallback />}
          >
            <RealtimeCharts />
          </Suspense>
        </div>
        <div>
          <AlertsCard />
        </div>
      </div>
    </div>
  );
}
