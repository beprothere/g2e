"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Lock, Unlock, Plus, Minus } from "lucide-react";

export function WalletOverview() {
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const res = await fetch("/api/admin/wallet-overview");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const totalBalance = data.deposits - data.withdrawals;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Platform Wallet</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Master account balance
            </p>
          </div>
          <Badge className="bg-primary/20 text-primary">Main Pool</Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-foreground">
            ${totalBalance.toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="p-3 rounded-lg bg-secondary/10">
            <p className="text-xs text-muted-foreground">Deposits</p>
            <p className="font-semibold text-secondary">
              ${data.deposits.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10">
            <p className="text-xs text-muted-foreground">Withdrawals</p>
            <p className="font-semibold text-destructive">
              ${data.withdrawals.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Plus className="h-4 w-4" /> Add Funds
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Minus className="h-4 w-4" /> Withdraw
          </Button>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-6">Wallet Status</h2>

        <div className="space-y-4">
          <div className="flex justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Locked Wallets</p>
              <p className="text-xs text-muted-foreground">Deactivated users</p>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="text-destructive" />
              <span className="text-lg font-bold">{data.lockedWallets}</span>
            </div>
          </div>

          <div className="flex justify-between p-4 rounded-lg bg-secondary/5">
            <div>
              <p className="text-sm font-medium">Active Wallets</p>
              <p className="text-xs text-muted-foreground">Activated users</p>
            </div>
            <div className="flex items-center gap-2">
              <Unlock className="text-secondary" />
              <span className="text-lg font-bold">{data.activeWallets}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5">
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium">Manual Adjustments</p>
              <Badge className="bg-primary/10 text-primary text-xs">
                Today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.manual.count} adjustments
            </p>
            <p className="text-lg font-bold text-primary mt-2">
              +${data.manual.plus} | ${data.manual.minus}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
