import InvestmentRequestsServer from "@/app/components/admin/investment-requests-server";
import InvestmentStatsServer from "@/app/components/admin/investment-stats-server";
import PlanSettingsServer from "@/app/components/admin/plan-settings-server";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function InvestmentStatsFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {["Total Investments", "Approved", "Pending", "Rejected"].map((label) => (
        <Card key={label} className="p-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Skeleton className="h-8 w-24 mt-3" />
          <Skeleton className="h-3 w-20 mt-3" />
        </Card>
      ))}
    </div>
  );
}

function InvestmentRequestsFallback() {
  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Investment Requests</h3>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function PlanSettingsFallback() {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Plan Settings</h3>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Investment Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and approve investment requests
        </p>
      </div>

      <Suspense fallback={<InvestmentStatsFallback />}>
        <InvestmentStatsServer />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<InvestmentRequestsFallback />}>
            <InvestmentRequestsServer searchParams={searchParams} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<PlanSettingsFallback />}>
            <PlanSettingsServer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
