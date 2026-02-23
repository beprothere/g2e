"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle2, Copy, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import TransactionHistory from "@/components/TransactionHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import Image from "next/image";
import { getActiveWallets } from "../actions/wallets";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(`${url}?t=${Date.now()}`, { cache: "no-store" }).then((res) =>
    res.json(),
  );

export default function PlanClientWrapper({
  initialPlans,
  userData: initialUserData,
  referralLink,
  initialTransactions,
}: any) {
  const router = useRouter();
  const { data: swrOverview, mutate: mutateOverview } = useSWR(
    "/api/plans/overview",
    fetcher,
    {
      fallbackData: { userData: initialUserData },
      refreshInterval: 1000,
    },
  );

  const { data: swrTrans, mutate: mutateTrans } = useSWR(
    "/api/wallet/transactions",
    fetcher,
    {
      fallbackData: {
        success: true,
        data: { transactions: initialTransactions },
      },
      refreshInterval: 1000,
    },
  );

  const userData = swrOverview?.userData || initialUserData;
  const transactions = swrTrans?.transactions || initialTransactions;

  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"JazzCash" | "EasyPaisa">(
    "JazzCash",
  );
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [tid, setTid] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [fetchingWallets, setFetchingWallets] = useState(true);

  const handleRemove = () => {
    setReceiptImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Number copied!");
  };

  const copyTotilClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Till ID copied!");
  };

  useEffect(() => {
    const loadWallets = async () => {
      setFetchingWallets(true);
      try {
        const data = await getActiveWallets();
        setWallets(data);
        if (data.length > 0) setSelectedWallet(data[0]);
      } catch (err) {
        toast.error("Failed to load payment methods");
      } finally {
        setFetchingWallets(false);
      }
    };
    loadWallets();
  }, []);

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "jazzcash":
        return "bg-[#f5a623]";
      case "easypaisa":
        return "bg-[#1fb47e]";
      case "bank":
        return "bg-[#003d7a]";
      default:
        return "bg-gray-600";
    }
  };

  const currentPlan = userData.plan;
  const status = userData.planStatus || "Inactive";
  const currentPlanData = initialPlans.find((p: any) => p.name === currentPlan);
  const sortedPlans = [...initialPlans].sort(
    (a: any, b: any) => a.price - b.price,
  );
  const currentIndex = sortedPlans.findIndex(
    (p: any) => p.name === currentPlan,
  );
  const nextPlan =
    currentIndex >= 0 && currentIndex < sortedPlans.length - 1
      ? sortedPlans[currentIndex + 1]
      : null;
  const canClaim =
    currentPlan !== "Free" &&
    userData.level1Count >= (currentPlanData?.members || 0);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between gap-10">
        <p className="text-sm text-foreground/60">
          <b>Current Balance:</b> ${userData.availableWithdraw}
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/wallet">Withdraw</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-primary/20 p-6 bg-linear-to-br from-primary/10 to-transparent">
          <span className="flex items-center justify-between">
            <p className="text-sm text-foreground/60 mb-2">Plan Budget</p>
            <p
              className={`inline-flex items-center gap-1 text-xs font-semibold ${status === "In Progress" ? "bg-primary/20 text-primary" : ""} ${status === "Pending" ? "bg-yellow-200 text-yellow-600" : ""} ${status === "Completed" ? "bg-accent/20 text-accent" : ""} ${status === "Rejected" ? "bg-destructive/20 text-destructive" : ""} px-2 py-1 rounded`}
            >
              <Zap size={12} /> {status}
            </p>
          </span>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-primary mb-2">
              {currentPlan === "Free" ? "Free" : `$${userData.planPrice}`}
            </p>
            {currentPlan !== "Free" && (
              <span className="text-lg font-semibold text-primary mb-2">
                {currentPlan}
              </span>
            )}
          </div>
          {currentPlan !== "Free" && (
            <Button
              className={`mt-4 w-full ${canClaim ? "bg-green-600" : "bg-gray-400"}`}
              disabled={!canClaim}
              onClick={async () => {
                const res = await fetch("/api/plans/claim", { method: "POST" });
                if (res.ok) {
                  toast.success("Claimed!");
                  mutateOverview();
                }
              }}
            >
              {canClaim ? "Claim" : "Locked"}
            </Button>
          )}
        </Card>

        <Card className="glass border-primary/20 p-6 bg-linear-to-br from-secondary/10 to-transparent">
          <p className="text-sm text-foreground/60 mb-2">Commission Rate</p>
          <p className="text-3xl font-bold text-secondary mb-2">
            {userData.commissionRate}%
          </p>
          <p className="text-sm text-foreground/60 mb-2">
            Upgrade to increase your rate.
          </p>
        </Card>

        <Card className="glass border-primary/20 p-6 bg-linear-to-br from-accent/10 to-transparent">
          <p className="text-sm text-foreground/60 mb-2">Your Team</p>
          <p className="text-3xl font-bold text-accent mb-2">
            {currentPlan === "Free"
              ? userData.level1Count
              : `${userData.level1Count}/${currentPlanData?.members || 0}`}
          </p>
          {nextPlan ? (
            <Button
              size="sm"
              className="w-full h-9 mt-2 bg-accent hover:bg-accent/90"
              onClick={() => {
                setSelectedPlan(nextPlan);
                setConfirmCheck(false);
                setOpen(true);
              }}
            >
              Upgrade to {nextPlan.name}
            </Button>
          ) : (
            currentPlan !== "Free" && (
              <Button size="sm" disabled className="w-full h-9 mt-2">
                Highest Plan Active
              </Button>
            )
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {initialPlans.map((plan: any, i: number) => (
          <Card
            key={i}
            className={`glass border-primary/20 p-8 transition-all duration-300 ${currentPlan === plan.name && status === "In Progress" ? "ring-2 ring-primary scale-105 shadow-premium" : "hover:shadow-premium"}`}
          >
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold">{plan.name} Plan</h3>
                {currentPlan === plan.name && status === "In Progress" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-accent/20 text-accent px-2 py-1 rounded">
                    <Zap size={12} /> Current
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-primary">{plan.invest}</p>
            </div>
            <div className="bg-linear-to-r from-primary/10 to-transparent rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/60 mb-1">
                Earnings Per Signup
              </p>
              <p className="text-3xl font-bold text-primary">{plan.earnings}</p>
            </div>
            <div className="space-y-3 mb-6">
              {plan.features.map((f: any, j: any) => (
                <div key={j} className="flex items-start gap-3">
                  <Check size={18} className="text-accent" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
            
            {currentPlan === plan.name && status === "In Progress" ? (
              <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold px-1">
                    Your Referral Link
                  </p>
                  <p className="text-xs truncate font-mono text-primary px-1">
                    {referralLink}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-primary hover:bg-primary/10"
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Link copied!");
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full h-11"
                onClick={() => {
                  setSelectedPlan(plan);
                  setConfirmCheck(false);
                  setOpen(true);
                }}
              >
                Upgrade to {plan.name}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <TransactionHistory initialData={transactions} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {selectedPlan?.name} Plan</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="space-y-2">
                {fetchingWallets ? (
                  <div className="flex justify-center py-4">
                    <Loader line="Loading Wallets..." />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {wallets.map((wallet) => (
                        <div
                          key={wallet._id}
                          onClick={() => {
                            setSelectedWallet(wallet);
                            setPayMethod(wallet.provider as any);
                          }}
                          className={`relative flex flex-row-reverse gap-2 items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedWallet?._id === wallet._id ? "border-primary bg-primary/5 shadow-md scale-105" : "border-gray-200 bg-white/50 hover:border-gray-300"}`}
                        >
                          {selectedWallet?._id === wallet._id && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                          <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">
                            {wallet.provider}
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedWallet && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-primary/10 bg-background">
                        <div
                          className={`${getProviderColor(selectedWallet.provider)} p-3 text-white text-center`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black italic">
                            Payment Detail ({selectedWallet.provider})
                          </p>
                        </div>
                        <div className="p-5 flex flex-col items-center space-y-4">
                          <div className="relative group">
                            <div className="p-2 bg-white rounded-xl border-2 border-dashed border-gray-200 group-hover:border-primary/50 transition-colors">
                              <Image
                                src={selectedWallet.qrPic}
                                alt="QR"
                                width={120}
                                height={120}
                                className="rounded-lg object-contain"
                              />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-center text-[8px] px-2 py-0.5 rounded-full font-bold">
                              SCAN & PAY
                            </div>
                          </div>
                          <div
                            className={`w-full space-y-1 ${getProviderColor(selectedWallet.provider)} text-white p-3 rounded-xl`}
                          >
                            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                              <span className="text-[14px] uppercase font-bold">
                                Holder Name
                              </span>
                              <span className="text-xs font-black uppercase">
                                {selectedWallet.holderName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[14px] uppercase font-bold block leading-none mb-1">
                                  Account Number
                                </span>
                                <span className="text-[12px] font-mono font-black tracking-tighter">
                                  0{selectedWallet.walletNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    `0${selectedWallet.walletNumber.toString()}`,
                                  )
                                }
                                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all active:scale-90"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[14px] uppercase font-bold block leading-none mb-1">
                                  IBAN Number
                                </span>
                                <span className="text-[12px] font-mono font-black tracking-tighter">
                                  {selectedWallet.walletTilId}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyTotilClipboard(
                                    selectedWallet.walletTilId.toString(),
                                  )
                                }
                                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all active:scale-90"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <Input
                placeholder="Enter Transaction ID"
                value={tid}
                onChange={(e) => setTid(e.target.value)}
              />
              <div className="space-y-3 w-full max-w-md">
                <Label className="text-sm font-semibold text-gray-700">
                  Upload Payment Receipt
                </Label>
                <div className="relative">
                  {!receiptImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group"
                    >
                      <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center px-4">
                        <p className="text-sm font-medium text-gray-600">
                          Click to capture or upload receipt
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group bg-gray-100">
                      <img
                        src={receiptImage}
                        className="w-full h-24 object-contain mx-auto"
                        alt="Receipt Preview"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemove}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e: any) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setReceiptImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
              </div>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmCheck}
                  onChange={(e) => setConfirmCheck(e.target.checked)}
                />
                I confirm I want to buy this plan
              </label>
              <Button
                className="w-full"
                disabled={!confirmCheck || !tid || !receiptImage}
                onClick={async () => {
                  const res = await fetch("/api/plans/buy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      targetPlan: selectedPlan.name,
                      method: payMethod.toLowerCase(),
                      tid,
                      receiptImage,
                    }),
                  });
                  if (res.ok) {
                    toast.success("Success!");
                    setOpen(false);
                    mutateOverview();
                  }
                }}
              >
                Confirm & Buy
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
