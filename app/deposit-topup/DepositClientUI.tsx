"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import TransactionHistory from "@/components/TransactionHistory";
import { useRouter } from "next/navigation";

const TID_MAP = {
  easypaisa: "123456789",
  jazzcash: "987654321",
};

export default function DepositClientUI({
  initialSummary,
  initialTransactions,
}: any) {
  const investedBalance = Number(initialSummary?.investedBalance || 0);
  const pendingDeposit = Number(initialSummary?.pendingDeposit || 0);
  const depositBalance = Number(initialSummary?.depositBalance || 0);
  const transactions = Array.isArray(initialTransactions)
    ? initialTransactions
    : [];

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"easypaisa" | "jazzcash">("easypaisa");
  const [amount, setAmount] = useState("");
  const [tid, setTid] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10MB image allowed");
      return;
    }
    setReceipt(file);
  };

  const submitDeposit = async () => {
    if (!amount || !tid || !receipt || !confirm) {
      toast.error("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("method", method);
      form.append("amount", amount);
      form.append("tid", tid);
      form.append("receipt", receipt);

      const res = await fetch("/api/deposit", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setOpen(false);
      setAmount("");
      setTid("");
      setReceipt(null);
      setConfirm(false);

      toast.success("Deposit request submitted successfully");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Top Up Funds</h1>
          <p className="text-foreground/70">
            Manage your wallet and top up funds to start earning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-primary/20 p-6 bg-linear-to-br from-primary/10 to-transparent">
            <p className="text-sm text-foreground/60 mb-2">Total Deposit</p>
            <p className="text-3xl font-bold text-primary mb-2">
              ${investedBalance.toFixed(2)}
            </p>
            <p className="text-xs text-foreground/60">
              Total funds deposited into your wallet
            </p>
          </Card>

          <Card className="glass border-primary/20 p-6 bg-linear-to-br from-secondary/10 to-transparent">
            <p className="text-sm text-foreground/60 mb-2">Pending Deposit</p>
            <p className="text-3xl font-bold text-secondary mb-2">
              ${pendingDeposit.toFixed(2)}
            </p>
            <p className="text-xs text-foreground/60">
              Funds currently being processed
            </p>
          </Card>

          <Card className="glass border-primary/20 p-6 bg-linear-to-br from-accent/10 to-transparent">
            <p className="text-sm text-foreground/60 mb-2">Available Deposit</p>
            <p className="text-3xl font-bold text-accent mb-2">
              ${depositBalance.toFixed(2)}
            </p>
            <button
              className="w-full h-9 mt-2 bg-accent hover:bg-accent/90 text-white rounded-md flex items-center justify-center text-sm font-medium transition-colors"
              onClick={() => setOpen(true)}
            >
              <Download size={16} className="mr-2" />
              Topup Funds
            </button>
          </Card>
        </div>

        <TransactionHistory initialData={transactions} />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Topup Funds</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2">
              <Button
                variant={method === "easypaisa" ? "default" : "outline"}
                onClick={() => setMethod("easypaisa")}
                className="flex-1"
              >
                EasyPaisa
              </Button>
              <Button
                variant={method === "jazzcash" ? "default" : "outline"}
                onClick={() => setMethod("jazzcash")}
                className="flex-1"
              >
                JazzCash
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Send payment to this Til ID</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={TID_MAP[method]} />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(TID_MAP[method]);
                    toast.success("Til ID copied to clipboard");
                  }}
                >
                  Copy
                </Button>
              </div>

              <div className="flex justify-center">
                <Image
                  src={`/qr-${method}.png`}
                  alt="QR"
                  width={160}
                  height={160}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter deposit amount"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tid">Transaction ID (TID)</Label>
              <Input
                value={tid}
                id="tid"
                onChange={(e) => setTid(e.target.value)}
                placeholder="Enter TID"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="img-rec">Payment Receipt (max 10MB)</Label>
              <Input
                type="file"
                id="img-rec"
                accept="image/*"
                onChange={onReceiptChange}
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <Checkbox
                checked={confirm}
                id="cf"
                onCheckedChange={(v) => setConfirm(!!v)}
              />
              <Label htmlFor="cf" className="text-sm cursor-pointer">
                I confirm the amount is correct
              </Label>
            </div>

            <Button
              disabled={submitting}
              onClick={submitDeposit}
              className="w-full bg-primary"
            >
              {submitting ? "Processing..." : "Confirm Topup"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
