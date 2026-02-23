"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRealtimeWithdrawals } from "./actions";
import { WithdrawalStats } from "@/app/components/admin/withdrawal-stats";
import { WithdrawalsTable } from "@/app/components/admin/withdrawals-table";

export default function WithdrawalsClient({
  stats: initialStats,
  data: initialData,
  total: initialTotal,
  page,
  showHeader = true,
}: any) {
  const router = useRouter();

  const [stats, setStats] = useState(initialStats);
  const [tableData, setTableData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    const refreshData = async () => {
      const res = await getRealtimeWithdrawals(page);
      
      if (res.stats) setStats(res.stats);
      
      if (res.rows) {
        const mapped = res.rows.data.map((tx: any) => {
          const from = tx.from ?? "";
          const number = from.match(/- ([^\s(]+)/)?.[1] ?? "-";
          const name = from.match(/\((.*?)\)/)?.[1] ?? "-";
          const rowId = String(tx._id || "");
          
          return {
            _id: rowId,
            id: `WTH-${rowId.slice(-6).toUpperCase()}`,
            user: tx.user || "Unknown",
            amount: Number(tx.amount || 0),
            method: from.toUpperCase().includes("EASY") ? "EasyPaisa" : "JazzCash",
            accountName: name,
            accountDetails: number,
            status: tx.status?.toLowerCase() === "completed" ? "completed" : 
                    tx.status?.toLowerCase() === "rejected" ? "rejected" : "pending",
            date: tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-PK") : "-",
            ip: tx.ip ?? "-",
          };
        });
        
        setTableData(mapped);
        setTotal(res.rows.total);
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
          <h1 className="text-3xl font-bold text-foreground">Withdrawal Management</h1>
        </div>
      )}

      <WithdrawalStats data={stats} />

      <WithdrawalsTable
        initialData={tableData}
        total={total}
        page={page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}