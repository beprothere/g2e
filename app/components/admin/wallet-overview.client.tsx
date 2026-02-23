"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Lock, Unlock, Plus } from "lucide-react";
import useSWR from "swr";
import ManualAdjustmentModal from "./ManualAdjustmentModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WalletOverviewClient({ initialData }: { initialData: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, mutate } = useSWR("/api/admin/wallet-overview", fetcher, {
    fallbackData: initialData,
    refreshInterval: 2000,
  });

  if (!mounted) return null;

  // --- MATH FIX: EVERYTHING IS A SUM ---
  const pureDeposit = Number(data?.manual?.plus || 0);
  const pureWithdraw = Math.abs(Number(data?.manual?.minus || 0));
  const pureCommission = Math.abs(Number(data?.manual?.commission || 0));

  // Box 2: Withdraw + Commission
  const totalOutflow = pureWithdraw + pureCommission;

  // Total Balance: Sab ka jama (90 + 360 = 450)
  const mainPoolBalance = pureDeposit + totalOutflow;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Manual Adjustment</h2>
            </div>
            <p className="text-sm text-muted-foreground">Master account balance</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-none">Main Pool</Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
        <p className="text-3xl font-bold">${mainPoolBalance.toLocaleString()}</p>

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="p-3 rounded-lg bg-secondary/10">
            <p className="text-xs text-muted-foreground">Adjustment Deposit</p>
            <p className="font-semibold text-secondary">${pureDeposit.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10">
            <p className="text-xs text-muted-foreground">Withdraw + Commission</p>
            <p className="font-semibold text-destructive">${totalOutflow.toLocaleString()}</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 gap-2 h-10 border-2 font-medium hover:bg-primary hover:text-white transition-all" 
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" /> Manage Adjustment Funds
        </Button>
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
              <span className="text-lg font-bold">{data?.lockedWallets || 0}</span>
            </div>
          </div>

          <div className="flex justify-between p-4 rounded-lg bg-secondary/5">
            <div>
              <p className="text-sm font-medium">Active Wallets</p>
              <p className="text-xs text-muted-foreground">Activated users</p>
            </div>
            <div className="flex items-center gap-2">
              <Unlock className="text-secondary" />
              <span className="text-lg font-bold">{data?.activeWallets || 0}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5">
            <p className="text-sm font-medium mb-1">Total Adjustment Summary</p>
            <p className="text-xs text-muted-foreground">{data?.manual?.count || 0} entries today</p>
            <div className="text-lg font-bold text-primary mt-2">
              <span className="text-secondary">+${pureDeposit.toLocaleString()}</span>
              <span className="mx-2 text-muted-foreground">|</span>
              <span className="text-destructive">-${totalOutflow.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      <ManualAdjustmentModal 
        open={modalOpen} 
        setOpen={(isOpen) => {
          setModalOpen(isOpen);
          if(!isOpen) mutate(); 
        }} 
      />
    </div>
  );
}