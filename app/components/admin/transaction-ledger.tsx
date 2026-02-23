"use client";

import { useEffect, useState } from "react";
import { MoreVertical, ArrowUp, ArrowDown, Send, Zap } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TransactionDetailModal from "./TransactionDetailModal";

interface Transaction {
  _id: string;
  userId: {
    fullName: string;
    availableWithdraw: number;
  };
  type: string;
  amount: number;
  status: "Pending" | "Completed" | "Rejected";
  createdAt: string;
}

export function TransactionLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); 
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const limit = 10;
  const fetchTransactions = async (showLoader = false) => {
    if (showLoader) setLoading(true);

    const res = await fetch(
      `/api/admin/transactions?page=${page}&limit=${limit}&type=${filter}`,
    );
    const json = await res.json();

    setTransactions(json.data);
    setTotal(json.total);

    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    fetchTransactions(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchTransactions(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [page, filter]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "approve" }),
    });
    fetchTransactions(false);
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "reject" }),
    });
    fetchTransactions(false);
  };

  const downloadImage = async () => {
    const el = document.getElementById("receipt");
    if (!el) return;
    const canvas = await html2canvas(el);
    const link = document.createElement("a");
    link.download = "receipt.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPDF = async () => {
    const el = document.getElementById("receipt");
    if (!el) return;
    const canvas = await html2canvas(el);
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 190, 0);
    pdf.save("receipt.pdf");
  };

  /* =======================
     UI HELPERS (same)
  ======================= */
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return <ArrowDown className="h-4 w-4" />;
      case "withdrawal":
        return <ArrowUp className="h-4 w-4" />;
      case "commission":
        return <Zap className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "bg-secondary/20 text-secondary";
      case "withdrawal":
        return "bg-destructive/20 text-destructive";
      case "commission":
        return "bg-accent/20 text-accent";
      case "adjustment - withdrawal":
        return "bg-destructive/20 text-destructive";
      case "adjustment - deposit":
        return "bg-accent/20 text-accent";
      case "adjustment - commission":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Completed")
      return (
        <Badge className="bg-secondary/20 text-secondary border-0 p-1">
          Completed
        </Badge>
      );
    if (status === "Pending")
      return (
        <Badge className="bg-accent/20 text-accent border-0 p-1">Pending</Badge>
      );
    return (
      <Badge className="bg-destructive/20 text-destructive border-0 p-1">
        Rejected
      </Badge>
    );
  };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <Card className="rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Transaction Ledger</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All wallet transactions and adjustments
            </p>
          </div>
          <Select defaultValue="all" onValueChange={setFilter}>
            <SelectTrigger className="w-40">
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
              <SelectItem value="Adjustment - Commission">
                Adjustment - Commission
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">ID</th>
                <th className="px-6 py-4 text-left font-semibold">User</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-right font-semibold">Amount</th>
                <th className="px-6 py-4 text-right font-semibold">
                  Balance After
                </th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    Loading transactions...
                  </td>
                </tr>
              )}

              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    No transactions found
                  </td>
                </tr>
              )}

              {!loading &&
                transactions.map((txn) => (
                  <tr
                    key={txn._id}
                    className="border-b border-border hover:bg-muted/30 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      TXN-{txn._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {txn.userId.fullName}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`w-fit p-2 rounded-lg ${getTypeColor(
                          txn.type,
                        )} flex items-center gap-2`}
                      >
                        {getTypeIcon(txn.type)}
                        <span className="text-xs font-medium">{txn.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${txn.userId.availableWithdraw.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(txn.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTxn(txn);
                              setOpenModal(true);
                            }}
                          >
                            Download Receipt
                          </DropdownMenuItem>

                          {txn.status === "Pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-secondary"
                                onClick={() => handleApprove(txn._id)}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleReject(txn._id)}
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

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {from} to {to} of {total} transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={to >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL */}
      {selectedTxn && (
        <TransactionDetailModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          transaction={selectedTxn}
          onDownloadImage={downloadImage}
          onDownloadPDF={downloadPDF}
        />
      )}
    </>
  );
}
