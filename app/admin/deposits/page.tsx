import { Suspense } from "react";
import DepositsClient from "./DepositsClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApiFetch } from "@/lib/server-api";

type DepositsSearchParams = { page?: string };

function DepositsFallback() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["Pending", "Approved Today", "Rejected", "Week Total"].map((label) => (
          <Card key={label} className="p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <Skeleton className="h-8 w-24 mt-3" />
            <Skeleton className="h-3 w-20 mt-3" />
          </Card>
        ))}
      </div>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Deposit Requests</h3>
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

async function DepositsDataSection({
  searchParams,
}: {
  searchParams: Promise<DepositsSearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const [statsResponse, depositsResponse] = await Promise.all([
    serverApiFetch<{
      pending: { count: number; amount: number };
      todayApproved: { count: number; amount: number };
      rejected: { count: number; amount: number };
      weekTotal: { count: number; amount: number };
    }>("/api/admin/deposit-stats", {
      method: "GET",
      authCookie: "admin_token",
    }),
    serverApiFetch<{ data: any[]; total: number }>(`/api/admin/deposits?page=${page}`, {
      method: "GET",
      authCookie: "admin_token",
    }),
  ]);

  const stats = statsResponse.success && statsResponse.data
    ? statsResponse.data
    : {
        pending: { count: 0, amount: 0 },
        todayApproved: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 },
        weekTotal: { count: 0, amount: 0 },
      };

  const tableData = depositsResponse.success ? depositsResponse.data?.data || [] : [];
  const total = depositsResponse.success ? depositsResponse.data?.total || 0 : 0;

  const mappedDeposits = tableData.map((tx: any) => {
    const fullId = String(tx._id || "");
    const sourceText = String(tx.from || tx.description || "").toLowerCase();

    return {
      _id: fullId,
      id: `DEP-${fullId.slice(-6).toUpperCase()}`,
      fullId,
      user: tx.user || "Unknown",
      email: tx.email || "N/A",
      address: tx.address || "N/A",
      amount: Number(tx.amount || 0),
      method: sourceText.includes("easy") ? "EasyPaisa" : "JazzCash",
      screenshot: tx.screenshot || "default.jpg",
      status:
        String(tx.status || "").toLowerCase() === "completed"
          ? "approved"
          : String(tx.status || "").toLowerCase() === "rejected"
            ? "rejected"
            : "pending",
      date: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-",
      Ip: tx.ip || "-",
      device: tx.device || "-",
    };
  });

  return (
    <DepositsClient
      stats={stats}
      tableData={mappedDeposits}
      total={total}
      page={page}
      showHeader={false}
    />
  );
}

export default function DepositsPage(props: {
  searchParams: Promise<DepositsSearchParams>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Deposit Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve deposit requests
        </p>
      </div>

      <Suspense fallback={<DepositsFallback />}>
        <DepositsDataSection searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
