"use client";

import React, { useState } from "react";
import { Card } from "./ui/card";
import toast from "react-hot-toast";
import { Check, Copy } from "lucide-react";

interface Transaction {
  _id: string;
  type: string;
  status: string;
  from?: string;
  amount: number;
  date: string;
}

interface TransactionHistoryProps {
  initialData?: Transaction[];
}

const TransactionHistory = ({ initialData = [] }: TransactionHistoryProps) => {
  const [copiedTxn, setCopiedTxn] = useState<{
    id: string;
    index: number;
  } | null>(null);

  const copyTransactionId = (id: string, index: number) => {
    navigator.clipboard.writeText(id);
    setCopiedTxn({ id, index });
    toast.success(`Transaction ID copied`);
    setTimeout(() => setCopiedTxn(null), 3000);
  };

  return (
    <Card className="glass border-primary/20 p-6 transaction-card">
      <h3 className="text-lg font-bold mb-6">Transaction History</h3>

      {initialData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-base font-semibold text-foreground/80">
            No transactions found
          </p>
          <p className="text-sm text-muted-foreground max-w-62.5 mx-auto mt-1">
            Your earnings, deposits, and withdrawals will appear here once they
            are processed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialData.map((tx, i) => {
            const status = String(tx?.status || "Pending");
            const from = String(tx?.from || tx?.type || "N/A");
            const type = String(tx?.type || "Transaction");
            const amount = Number(tx?.amount || 0);
            const txId = String(tx?._id || `tx-${i}`);
            const date = String(tx?.date || "-");

            return (
              <div
                key={txId}
                className="relative tran-card-box justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition gap-4"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-sm txt-type-trans">
                        {type}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded trans-status-line ${
                          status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p
                      className="text-xs text-foreground/60 txt-from"
                      title={from}
                    >
                      {from.length > 30 ? `${from.slice(0, 30)}...` : from}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${amount > 0 ? "text-accent" : "text-red-500"}`}
                    >
                      {amount > 0 ? "+" : "-"}${Math.abs(amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-foreground/60">{date}</p>
                  </div>

                  <button
                    className="ml-4 p-2 rounded-lg hover:bg-muted/50 transition copy-transaction-id"
                    title="Copy transaction ID"
                    onClick={() => copyTransactionId(txId, i)}
                  >
                    {copiedTxn?.id === txId && copiedTxn?.index === i ? (
                      <Check size={16} className="text-accent" />
                    ) : (
                      <Copy size={16} className="text-foreground/60" />
                    )}
                  </button>
                </div>
                {status === "Pending" ? (
                  <p className="text-xs text-foreground/60 pt-3">
                    Please wait for 7–24 hours. You will be notified once the
                    transaction is complete.
                  </p>
                ) : (
                  ""
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TransactionHistory;
