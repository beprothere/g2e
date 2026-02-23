import { Suspense } from "react";
import SerumOrdersClient from "./SerumOrdersClient";
import SerumManager from "./SerumManager";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApiFetch } from "@/lib/server-api";

type SerumOrderSearchParams = Record<string, string | string[] | undefined>;

function SerumInventoryFallback() {
  return (
    <div className="py-6 w-full space-y-6">
      <div className="flex w-full justify-between items-center bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serum Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product list and features
          </p>
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <div className="flex flex-col gap-4 w-full">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="rounded-2xl py-2 border border-border/60 bg-card">
            <div className="flex flex-col md:flex-row items-center gap-4 p-4">
              <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 w-full">
                <Skeleton className="h-6 w-52" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="flex md:flex-col gap-2 shrink-0">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SerumOrdersFallback() {
  return (
    <Card className="p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
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

async function SerumManagerSection() {
  const response = await serverApiFetch<{ success: boolean; serums: any[] }>(
    "/api/admin/serums",
    {
      method: "GET",
      authCookie: "admin_token",
    },
  );

  const serums =
    response.success && response.data?.success ? response.data.serums || [] : [];
  return <SerumManager initialSerums={serums} />;
}

async function SerumOrdersSection({
  searchParams,
}: {
  searchParams: Promise<SerumOrderSearchParams>;
}) {
  const sp = await searchParams;
  const search = String(sp.search ?? "");
  const status = String(sp.status ?? "all");
  const dateRange = String(sp.dateRange ?? "all");
  const page = Number(sp.page ?? 1);
  const limit = Number(sp.limit ?? 10);

  const query = new URLSearchParams({
    search,
    status,
    dateRange,
    page: String(page),
    limit: String(limit),
  });

  const response = await serverApiFetch<{
    orders: any[];
    total?: number;
    page: number;
    pages: number;
  }>(`/api/admin-panel/serum-order-list?${query.toString()}`, {
    method: "GET",
    authCookie: "admin_token",
  });

  const orders = response.success ? response.data?.orders || [] : [];
  const pages = response.success ? response.data?.pages || 0 : 0;
  const total = response.success ? response.data?.total || 0 : 0;

  return (
    <SerumOrdersClient
      initialOrders={orders}
      total={total}
      pages={pages}
      currentFilters={{ search, status, dateRange, page, limit }}
    />
  );
}

export default function SerumOrderPage({
  searchParams,
}: {
  searchParams: Promise<SerumOrderSearchParams>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Serum Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage serum inventory and customer order processing
        </p>
      </div>

      <Suspense fallback={<SerumInventoryFallback />}>
        <SerumManagerSection />
      </Suspense>

      <Suspense fallback={<SerumOrdersFallback />}>
        <SerumOrdersSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
