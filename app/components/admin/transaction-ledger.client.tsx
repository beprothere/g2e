"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Send,
  Zap,
  SearchX,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionDetailModal from "./TransactionDetailModal";
import { updateTransactionStatus } from "@/app/admin/wallets/actions";
import toast from "react-hot-toast";

export default function TransactionLedgerClient({
  initialTransactions,
  total,
  currentPage,
  currentFilter,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const limit = 5;

  const updateURL = (newPage: number, newFilter: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      params.set("type", newFilter);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleStatusChange = (id: string, action: "approve" | "reject") => {
    startTransition(async () => {
      const res = await updateTransactionStatus(id, action);
      if (res.success) toast.success("Success");
      else toast.error("Failed");
    });
  };

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("deposit")) return <ArrowDown className="h-4 w-4" />;
    if (t.includes("withdrawal")) return <ArrowUp className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("deposit")) return "bg-secondary/20 text-secondary";
    if (t.includes("withdrawal")) return "bg-destructive/20 text-destructive";
    return "bg-accent/20 text-accent";
  };

  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  return (
    <>
      <Card
        className={`rounded-2xl lg:mt-0 mt-6 overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Transaction Ledger</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All wallet transactions and adjustments
            </p>
          </div>

          <Select
            value={currentFilter}
            onValueChange={(val) => updateURL(1, val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Deposit">Deposits</SelectItem>
              <SelectItem value="Withdrawal">Withdrawals</SelectItem>
              <SelectItem value="Commission">Commissions</SelectItem>
              <SelectItem value="Adjustment - Deposit">
                Adjustment - Deposit
              </SelectItem>
              <SelectItem value="Adjustment - Withdrawal">
                Adjustment - Withdrawal
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                      <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
                        <SearchX size={48} className="text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        No records found
                      </h3>
                      <p className="text-gray-400 text-sm max-w-sm mt-2 font-medium">
                        We couldn't find any results matching your search or
                        filters. Please try again with different keywords or
                        reset your selection.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {initialTransactions.map((txn: any) => (
                <tr
                  key={txn._id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs uppercase text-muted-foreground">
                    TXN-{txn._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {txn.userId?.fullName || "System"}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={`w-fit p-2 rounded-lg ${getTypeColor(txn.type)} flex items-center gap-2`}
                    >
                      {getTypeIcon(txn.type)}
                      <span className="text-xs font-medium">{txn.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    ${txn.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={
                        txn.status === "Completed"
                          ? "text-green-600"
                          : txn.status === "Pending"
                            ? "text-orange-500"
                            : "text-red-600"
                      }
                    >
                      {txn.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTxn(txn);
                            setOpenModal(true);
                          }}
                        >
                          View
                        </DropdownMenuItem>
                        {txn.status === "Pending" && (
                          <>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() =>
                                handleStatusChange(txn._id, "approve")
                              }
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleStatusChange(txn._id, "reject")
                              }
                            >
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Trigger */}
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {from} to {to} of {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isPending}
              onClick={() => updateURL(currentPage - 1, currentFilter)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={to >= total || isPending}
              onClick={() => updateURL(currentPage + 1, currentFilter)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {selectedTxn && (
        <TransactionDetailModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          transaction={selectedTxn}
        />
      )}
    </>
  );
}
