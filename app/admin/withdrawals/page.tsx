import { Suspense } from "react";
import WithdrawalsClient from "./WithdrawalsClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApiFetch } from "@/lib/server-api";

export const dynamic = "force-dynamic";

type WithdrawalsSearchParams = { page?: string };

function WithdrawalsFallback() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["Total Requests", "Approved", "Pending", "Rejected"].map((label) => (
          <Card key={label} className="p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <Skeleton className="h-8 w-24 mt-3" />
            <Skeleton className="h-3 w-20 mt-3" />
          </Card>
        ))}
      </div>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Withdrawal Requests</h3>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-full" />
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

async function WithdrawalsDataSection({
  searchParams,
}: {
  searchParams: Promise<WithdrawalsSearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const [statsResponse, rowsResponse] = await Promise.all([
    serverApiFetch<{
      pending: { count: number; amount: number };
      todayProcessed: { count: number; amount: number };
      weekTotal: { count: number; amount: number };
      rejected: { count: number; amount: number };
    }>("/api/admin/withdrawal-stats", {
      method: "GET",
      authCookie: "admin_token",
    }),
    serverApiFetch<{ data: any[]; total: number }>(`/api/admin/withdrawals?page=${page}`, {
      method: "GET",
      authCookie: "admin_token",
    }),
  ]);

  const stats = statsResponse.success && statsResponse.data
    ? statsResponse.data
    : {
        pending: { count: 0, amount: 0 },
        todayProcessed: { count: 0, amount: 0 },
        weekTotal: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 },
      };

  const rows = rowsResponse.success ? rowsResponse.data?.data || [] : [];
  const total = rowsResponse.success ? rowsResponse.data?.total || 0 : 0;

  const mappedWithdrawals = rows.map((tx: any) => {
    const from = tx.from ?? "";
    const number = from.match(/- ([^\s(]+)/)?.[1] ?? "-";
    const name = from.match(/\((.*?)\)/)?.[1] ?? "-";
    const normalizedStatus = String(tx.status || "").toLowerCase();
    const rowId = String(tx._id || "");

    return {
      _id: rowId,
      id: `WTH-${rowId.slice(-6).toUpperCase()}`,
      user: tx.user || "Unknown",
      amount: Number(tx.amount || 0),
      method: from.toUpperCase().includes("EASY") ? "EasyPaisa" : "JazzCash",
      accountName: name,
      accountDetails: number,
      status:
        normalizedStatus === "completed"
          ? "completed"
          : normalizedStatus === "rejected"
            ? "rejected"
            : "pending",
      date: tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-PK") : "-",
      ip: tx.ip ?? "-",
    };
  });

  return (
    <WithdrawalsClient
      stats={stats}
      data={mappedWithdrawals}
      total={total}
      page={page}
      showHeader={false}
    />
  );
}

export default function WithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<WithdrawalsSearchParams>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Withdrawal Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Process and approve withdrawal requests
        </p>
      </div>

      <Suspense fallback={<WithdrawalsFallback />}>
        <WithdrawalsDataSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
