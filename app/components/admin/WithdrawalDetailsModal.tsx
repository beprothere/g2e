"use client";

import { X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  withdrawal: any;
  onApprove: () => void;
  onReject: () => void;
}

export function WithdrawalDetailsModal({
  open,
  onClose,
  withdrawal,
  onApprove,
  onReject,
}: Props) {
  if (!open || !withdrawal) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Withdrawal Details</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">User</p>
            <p className="font-medium">{withdrawal.user}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Account</p>
            <p className="font-medium">{withdrawal.accountName}</p>
            <p className="text-muted-foreground">{withdrawal.accountDetails}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold text-destructive">
                -${withdrawal.amount}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Method</p>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-0"
              >
                {withdrawal.method}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{withdrawal.status}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{withdrawal.date}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-3">
          <Button
            className="w-full sm:w-auto bg-secondary text-secondary-foreground gap-2"
            onClick={onApprove}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>

          <Button
            variant="destructive"
            className="w-full sm:w-auto gap-2"
            onClick={onReject}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
