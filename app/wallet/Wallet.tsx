"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  Star,
  X,
  CreditCard,
  ChevronDown,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import TransactionHistory from "@/components/TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWalletDataAction,
  submitWithdrawAction,
  saveWithdrawAccountAction,
  makeAccountPrimaryAction,
  removeAccountAction,
} from "@/app/actions/walletActions";

type WalletSummary = {
  totalEarning?: number;
  pendingWithdraw?: number;
  availableWithdraw?: number;
};

type WalletResponse = {
  success?: boolean;
  summary?: WalletSummary;
  accounts?: any[];
  transactions?: any[];
  error?: string;
};

const mapSummary = (summary?: WalletSummary) => ({
  total: summary?.totalEarning || 0,
  pending: summary?.pendingWithdraw || 0,
  available: summary?.availableWithdraw || 0,
});

const normalizeAccounts = (accounts: any[] = []) =>
  accounts.map((account) => ({
    ...account,
    _id: String(account._id),
  }));

const normalizeTransactions = (transactions: any[] = []) =>
  transactions.map((tx) => ({
    ...tx,
    _id: String(tx._id),
    from: tx.from || tx.description || tx.type || "Wallet activity",
    date:
      tx.date || (tx.createdAt ? new Date(tx.createdAt).toDateString() : ""),
  }));

export default function Wallet({
  initialData,
}: {
  initialData: WalletResponse;
}) {
  const initialAccounts = normalizeAccounts(initialData.accounts || []);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletData, setWalletData] = useState(mapSummary(initialData.summary));
  const [withdrawAccounts, setWithdrawAccounts] =
    useState<any[]>(initialAccounts);
  const [transactions, setTransactions] = useState<any[]>(
    normalizeTransactions(initialData.transactions || []),
  );

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(
    initialAccounts.find((a) => a.isPrimary)?._id ||
      initialAccounts[0]?._id ||
      "",
  );

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    method: "EasyPaisa",
    number: "",
    holderName: "",
  });

  const loadData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setIsRefreshing(true);
    try {
      const res = await getWalletDataAction();

      if (res.success && res.summary) {
        const accounts = normalizeAccounts(res.accounts || []);
        setWalletData(mapSummary(res.summary));
        setWithdrawAccounts(accounts);
        setTransactions(normalizeTransactions(res.transactions || []));

        setSelectedAccount((currentValue: string) => {
          if (currentValue && accounts.some((a) => a._id === currentValue)) {
            return currentValue;
          }
          const primary = accounts.find((a) => a.isPrimary);
          return primary?._id || accounts[0]?._id || "";
        });
      }
    } catch {
      console.error("Silent refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  const openWithdraw = () => {
    if (withdrawAccounts.length === 0) {
      toast.error("Please save a withdrawal account first");
      return;
    }
    if ((walletData?.available ?? 0) < 10) {
      toast.error("Available balance must be at least $10");
      return;
    }
    setShowWithdrawModal(true);
  };

  const submitWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 10) {
      return toast.error("Minimum withdrawal amount is $10");
    }
    if (!selectedAccount) {
      return toast.error("Please select a withdrawal account");
    }
    if (amount > walletData.available) {
      return toast.error("Insufficient available balance");
    }

    const res = await submitWithdrawAction(amount, selectedAccount);
    if (res.success) {
      toast.success("Withdrawal request submitted");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      await loadData(true);
    } else {
      toast.error(res.error || "Withdrawal failed");
    }
  };

  const saveWithdrawAccount = async () => {
    if (!newAccount.number || !newAccount.holderName) {
      return toast.error("Required fields missing");
    }

    const res = await saveWithdrawAccountAction({
      ...newAccount,
      accountId: editingAccountId,
    });
    if (res.success) {
      toast.success(editingAccountId ? "Account updated" : "Account added");
      setShowAccountModal(false);
      setEditingAccountId(null);
      setNewAccount({ method: "EasyPaisa", number: "", holderName: "" });
      await loadData(true);
    } else {
      toast.error(res.error || "Failed to save");
    }
  };

  const makePrimary = async (id: string) => {
    const res = await makeAccountPrimaryAction(id);
    if (res.success) {
      toast.success("Primary account updated");
      await loadData(true);
    }
  };

  const removeAccount = async () => {
    if (!confirmRemoveId) return;
    const res = await removeAccountAction(confirmRemoveId);
    if (res.success) {
      toast.success("Account removed");
      setConfirmRemoveId(null);
      await loadData(true);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
        <p className="text-foreground/70">
          Manage your funds and track transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-primary/20 p-6 bg-linear-to-br from-primary/10 to-transparent">
          <p className="text-sm text-foreground/60 mb-2">Total Earned</p>
          {isRefreshing ? (
            <Skeleton className="h-9 w-28 mb-2" />
          ) : (
            <p className="text-3xl font-bold text-primary mb-2">
              ${(walletData?.total ?? 0).toFixed(2)}
            </p>
          )}
          <p className="text-xs text-foreground/60">All time earnings</p>
        </Card>

        <Card className="glass border-primary/20 p-6 bg-linear-to-br from-secondary/10 to-transparent">
          <p className="text-sm text-foreground/60 mb-2">Pending</p>
          {isRefreshing ? (
            <Skeleton className="h-9 w-28 mb-2" />
          ) : (
            <p className="text-3xl font-bold text-secondary mb-2">
              ${(walletData?.pending ?? 0).toFixed(2)}
            </p>
          )}
          <p className="text-xs text-foreground/60">
            Processing (Admin approval)
          </p>
        </Card>

        <Card className="glass border-primary/20 p-6 bg-linear-to-br from-accent/10 to-transparent">
          <span className="relative">
            <p className="text-sm text-foreground/60 mb-2">
              Available to Withdraw
            </p>
            <p className="text-xs text-forground absolute top-1 right-2">
              Min Withdraw: $10
            </p>
          </span>
          {isRefreshing ? (
            <Skeleton className="h-9 w-28 mb-2" />
          ) : (
            <p className="text-3xl font-bold text-accent mb-2">
              ${(walletData?.available ?? 0).toFixed(2)}
            </p>
          )}
          <Button
            size="sm"
            className="w-full h-9 mt-2 bg-accent hover:bg-accent/90"
            onClick={openWithdraw}
            disabled={isRefreshing || (walletData?.available ?? 0) < 10}
          >
            <Download size={16} className="mr-2" /> Withdraw
          </Button>
        </Card>
      </div>

      <Card className="glass border-primary/20 p-6">
        <h3 className="text-lg font-bold mb-6">Withdrawal Settings</h3>
        {isRefreshing ? (
          <div className="space-y-4 mb-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : withdrawAccounts.length === 0 ? (
          <p className="text-sm text-foreground/60 mb-4">
            You have not added any withdrawal account yet.
          </p>
        ) : (
          withdrawAccounts.map((acc, i) => (
            <div key={i} className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">
                  {acc.method} {acc.isPrimary && "(Primary)"}
                </p>
                <p className="text-sm text-foreground/60">{acc.number}</p>
                <p className="text-xs text-foreground/50 capitalize">
                  {acc.holderName || "-"}
                </p>
              </div>
              <div className="flex gap-2">
                {!acc.isPrimary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => makePrimary(acc._id)}
                  >
                    <Star size={14} />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingAccountId(acc._id);
                    setNewAccount({
                      method: acc.method,
                      number: acc.number,
                      holderName: acc.holderName || "",
                    });
                    setShowAccountModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmRemoveId(acc._id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={() => setShowAccountModal(true)}
          disabled={isRefreshing}
        >
          Add Withdrawal Account
        </Button>
      </Card>

      <TransactionHistory initialData={transactions} />

      {confirmRemoveId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-xl w-full max-w-sm space-y-4">
            <p className="font-semibold">
              Are you sure you want to remove your wallet account?
            </p>
            <Button className="w-full" onClick={removeAccount}>
              Yes, Remove
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setConfirmRemoveId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-100 sm:px-4 transition-all px-4">
          <div className="bg-background w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl border border-primary/10 overflow-hidden animate-in slide-in-from-bottom duration-300 mb-40 sm:mb-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Download className="text-accent" size={18} /> Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-muted rounded-full transition active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 pb-10 sm:pb-6">
              <div className="space-y-2">
                <span className="flex w-full items-center justify-between gap-2 pb-1">
                  <label className="text-sm font-medium text-foreground/70 ml-1">
                    Enter Amount
                  </label>
                  <p className="text-foreground/60 text-xs">Minimum: $10</p>
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-foreground/40 group-focus-within:text-primary transition">
                      $
                    </span>
                    <input
                      type="number"
                      className="w-full bg-muted/30 border-2 border-border focus:border-primary rounded-2xl py-3 pl-10 pr-4 outline-none text-xl font-bold transition-all"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="px-5 h-auto font-bold rounded-2xl border-2 border-transparent active:scale-95 transition bg-primary text-white"
                    onClick={() =>
                      setWithdrawAmount(walletData.available.toString())
                    }
                  >
                    MAX
                  </Button>
                </div>
                <p className="text-xs text-foreground/50 text-right mr-1">
                  Available:{" "}
                  <span className="text-green-600 font-bold">
                    ${walletData.available.toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 ml-1">
                  Select Destination
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-muted/30 border-2 border-border focus:border-primary rounded-2xl py-4 px-4 outline-none appearance-none transition-all cursor-pointer font-medium"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                  >
                    <option value="">Choose your account</option>
                    {withdrawAccounts.map((acc, i) => (
                      <option key={i} value={acc._id}>
                        {acc.method} • {acc.number}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
              <div className="py-2 space-y-3">
                <Button
                  className="w-full py-7 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-xl shadow-green-600/20 active:scale-[0.97] transition-all"
                  onClick={submitWithdraw}
                >
                  Confirm Withdrawal
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-foreground/60 py-4"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel & Go Back
                </Button>
              </div>
              <span className="flex items-start gap-2 text-xs text-foreground/60">
                <Info size={52} className="text-foreground/60" />
                <p className="pt-2">
                  Your withdrawal will be credited to your selected account
                  within 7–24 hours. Please wait for 7–24 hours. You will be
                  notified once the transfer is complete.
                </p>
              </span>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 lg:px-0 md:px-0 sm:px-0 transition-all">
          <div className="bg-background w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl border border-primary/10 overflow-hidden animate-in slide-in-from-bottom duration-300 mb-40 lg:mb-0 md:mb-0 sm:mb-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="text-primary" size={20} />
                {editingAccountId ? "Edit Account" : "Add Account"}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-2 hover:bg-muted rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {["EasyPaisa", "JazzCash"].map((m) => (
                  <div
                    key={m}
                    onClick={() => setNewAccount({ ...newAccount, method: m })}
                    className={`cursor-pointer p-4 rounded-xl border-2 text-center font-bold transition-all ${
                      newAccount.method === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {m}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 ml-1">
                    ACCOUNT NUMBER
                  </label>
                  <input
                    className="w-full bg-muted/30 border-2 border-border focus:border-primary rounded-xl py-3 px-4 outline-none transition-all"
                    placeholder="e.g. 03001234567"
                    type="number"
                    value={newAccount.number}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        number: e.target.value.slice(0, 11),
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/50 ml-1">
                    ACCOUNT HOLDER NAME
                  </label>
                  <input
                    className="w-full bg-muted/30 border-2 border-border focus:border-primary rounded-xl py-3 px-4 outline-none transition-all"
                    placeholder="Full Name"
                    value={newAccount.holderName}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        holderName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition"
                  onClick={saveWithdrawAccount}
                >
                  {editingAccountId ? "Update Account" : "Save Account"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
