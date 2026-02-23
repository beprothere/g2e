"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DepositStats } from "@/app/components/admin/deposit-stats";
import { DepositsTable } from "@/app/components/admin/deposits-table";
import { getRealtimeDeposits } from "@/app/admin/deposits/actions";

export default function DepositsClient({
  stats: initialStats,
  tableData: initialTableData,
  total: initialTotal,
  page,
  showHeader = true,
}: {
  stats: any;
  tableData: any[];
  total: number;
  page: number;
  showHeader?: boolean;
}) {
  const router = useRouter();

  const [stats, setStats] = useState(initialStats);
  const [tableData, setTableData] = useState(initialTableData);
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    const refreshData = async () => {
      try {
        const res = await getRealtimeDeposits(page);

        if (res.stats) {
          setStats(res.stats);
        }

        if (res.deposits) {
          const mapped = res.deposits.data.map((tx: any) => {
            const fullId = String(tx._id || "");
            const sourceText = String(
              tx.from || tx.description || "",
            ).toLowerCase();
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
                tx.status?.toLowerCase() === "completed"
                  ? "approved"
                  : tx.status?.toLowerCase() === "rejected"
                    ? "rejected"
                    : "pending",
              date: tx.createdAt
                ? new Date(tx.createdAt).toLocaleString()
                : "-",
              Ip: tx.ip || "-",
              device: tx.device || "-",
            };
          });

          setTableData(mapped);
          setTotal(res.deposits.total);
        }
      } catch (error) {
        console.error("Real-time update failed:", error);
      }
    };

    const interval = setInterval(refreshData, 4000);

    return () => clearInterval(interval);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Deposit Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve deposit requests (Live Updating)
          </p>
        </div>
      )}

      <DepositStats initialData={stats} />

      <DepositsTable
        initialData={tableData}
        total={total}
        page={page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
