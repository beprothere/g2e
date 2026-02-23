import { Suspense } from "react";
import { notFound } from "next/navigation";
import UserProfileClient from "./UserProfileClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApiFetch } from "@/lib/server-api";

function UserProfileFallback() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Profile Overview</h3>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </Card>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">User Activity</h3>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}

async function UserProfileDataSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [userResponse, ordersResponse, transactionsResponse] = await Promise.all([
    serverApiFetch<any>(`/api/admin-panel/platform-users/${encodeURIComponent(id)}`, {
      method: "GET",
      authCookie: "admin_token",
    }),
    serverApiFetch<{ orders: any[] }>(
      `/api/admin-panel/serum-orders?userId=${encodeURIComponent(id)}`,
      {
        method: "GET",
        authCookie: "admin_token",
      },
    ),
    serverApiFetch<{ data: any[] }>(
      `/api/admin/transactions?userId=${encodeURIComponent(id)}&page=1&limit=200`,
      {
        method: "GET",
        authCookie: "admin_token",
      },
    ),
  ]);

  if (!userResponse.success || !userResponse.data || (userResponse.data as any).error) {
    notFound();
  }

  return (
    <UserProfileClient
      initialUser={userResponse.data}
      userId={id}
      initialOrders={ordersResponse.success ? ordersResponse.data?.orders || [] : []}
      initialTransactions={
        transactionsResponse.success ? transactionsResponse.data?.data || [] : []
      }
    />
  );
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<UserProfileFallback />}>
      <UserProfileDataSection params={params} />
    </Suspense>
  );
}
