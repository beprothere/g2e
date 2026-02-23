"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  downloadAsImage,
  downloadAsPDF,
} from "@/hooks/useReceiptDownload";

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
}: any) {
  const receiptRef = useRef<HTMLDivElement>(null);
  if (!transaction) return null;

  const statusColor =
    transaction.status === "Completed"
      ? "bg-secondary/20 text-secondary"
      : transaction.status === "Pending"
      ? "bg-accent/20 text-accent"
      : "bg-destructive/20 text-destructive";

  const typeColor =
    transaction.type.toLowerCase().includes("deposit")
      ? "bg-secondary/20 text-secondary"
      : transaction.type.toLowerCase().includes("withdraw")
      ? "bg-destructive/20 text-destructive"
      : "bg-primary/20 text-primary";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div
          ref={receiptRef}
          className="border rounded-xl p-4 bg-white"
        >
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">
            USER INFORMATION
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Full Name</p>
              <p className="font-medium">{transaction.userId.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">User ID</p>
              <p className="font-mono text-xs">{transaction.userId._id}</p>
            </div>
          </div>

          <hr className="my-4" />

          <h3 className="text-xs font-semibold text-muted-foreground mb-3">
            TRANSACTION DETAILS
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-xs">
                TXN-{transaction._id.slice(-6)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Date</p>
              <p>{new Date(transaction.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Type</p>
              <Badge className={typeColor}>{transaction.type}</Badge>
            </div>

            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge className={statusColor}>{transaction.status}</Badge>
            </div>

            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold">
                ${transaction.amount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Balance After</p>
              <p className="font-semibold">
                ${transaction.userId.availableWithdraw.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            className="flex-1"
            onClick={() =>
              receiptRef.current &&
              downloadAsImage(
                receiptRef.current,
                `receipt-${transaction._id}`,
              )
            }
          >
            Download Image
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              receiptRef.current &&
              downloadAsPDF(
                receiptRef.current,
                `receipt-${transaction._id}`,
              )
            }
          >
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
