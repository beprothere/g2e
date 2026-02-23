"use client";

import { useState, useTransition } from "react";
import { handleWalletAction } from "@/app/admin/wallets/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Wallet,
  Copy,
  Check,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

export function MerchantWallets({ initialWallets }: { initialWallets: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCred, setShowCred] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 1200);
  };

  const statusStyle = (s: string) => {
    if (s === "active") return "bg-green-100 text-green-700";
    if (s === "inactive") return "bg-gray-200 text-gray-600";
    return "bg-red-100 text-red-600";
  };

  const runAction = (method: "POST" | "PUT" | "DELETE", data?: any) => {
    startTransition(async () => {
      const res = await handleWalletAction(data, method);
      if (res.success) {
        toast.success(`Wallet ${method === "DELETE" ? "Deleted" : "Updated"}`);
        setAddOpen(false);
        setEditingId(null);
        setDeleteOpen(false);
        setForm({});
      } else {
        toast.error("Operation failed");
      }
    });
  };

  return (
    <div className="space-y-6 lg:mt-0 mt-6">
      <div className="flex justify-between items-center flex-col lg:flex-row gap-6">
        <div>
          <h2 className="text-2xl font-bold">Merchant Wallets</h2>
          <p className="text-sm text-muted-foreground">
            Manage merchant wallet addresses and balances
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({});
            setAddOpen(true);
          }}
          className="gap-2 w-full lg:w-fit"
        >
          <Plus className="h-4 w-4" /> Add Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialWallets.map((w) => {
          const editing = editingId === w._id;
          return (
            <Card
              key={w._id}
              className={`p-5 rounded-xl gap-2! ${isPending && editingId === w._id ? "opacity-70" : ""}`}
            >
              <div className="flex justify-between">
                <div>
                  {editing ? (
                    <Input
                      value={form.walletName}
                      onChange={(e) =>
                        setForm({ ...form, walletName: e.target.value })
                      }
                    />
                  ) : (
                    <h3 className="font-semibold text-lg">{w.walletName}</h3>
                  )}
                  <Badge className={`mt-2 ${statusStyle(w.status)}`}>
                    {w.status}
                  </Badge>
                </div>
                <Wallet className="text-primary" />
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Wallet Address</p>
                {editing ? (
                  <Input
                    value={form.walletAddress}
                    onChange={(e) =>
                      setForm({ ...form, walletAddress: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">
                      {w.walletAddress}
                    </code>
                    <button onClick={() => copyText(w.walletAddress, w._id)}>
                      {copiedId === w._id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Balance</p>
                {editing ? (
                  <Input
                    type="number"
                    value={form.balance}
                    onChange={(e) =>
                      setForm({ ...form, balance: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-xl font-bold">
                    ${w.balance.toLocaleString()}
                  </p>
                )}
              </div>

              {editing && (
                <div className="mt-3 text-start">
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-1">
                    {["suspended", "active", "inactive"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex-1 py-1.5 rounded text-sm ${form.status === s ? "bg-primary text-white" : "bg-muted"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t mt-4">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{w.createdAt.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Tx</p>
                  <p>{w.updatedAt.slice(0, 10)}</p>
                </div>
              </div>

              {editing && (
                <div className="mt-3 text-start">
                  <button
                    onClick={() =>
                      setShowCred(showCred === w._id ? null : w._id)
                    }
                    className="text-xs text-primary flex items-center gap-1"
                  >
                    Edit Credentials <ChevronDown className="h-3 w-3" />
                  </button>
                  {showCred === w._id && (
                    <div className="space-y-2 mt-2">
                      {["merchantId", "storeId", "apiKey", "apiSecret"].map(
                        (k) => (
                          <Input
                            key={k}
                            placeholder={k}
                            value={form.credentials?.[k] || ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                credentials: {
                                  ...form.credentials,
                                  [k]: e.target.value,
                                },
                              })
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {editing ? (
                  <>
                    <Button
                      disabled={isPending}
                      className="flex-1"
                      onClick={() => runAction("PUT", form)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-lg py-2"
                      onClick={() => {
                        setEditingId(w._id);
                        setForm(w);
                      }}
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 rounded-lg py-2"
                      onClick={() => {
                        setSelected(w);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        

        <DialogContent className="max-w-lg px-4">
          <DialogHeader>
            <DialogTitle>Add Merchant Wallet</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Wallet Name</Label>
              <Input
                value={form.walletName || ""}
                onChange={(e) =>
                  setForm({ ...form, walletName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Provider</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.provider || ""}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              >
                <option value="">Select provider</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
            </div>
            <div>
              <Label>Wallet Address</Label>
              <Input
                value={form.walletAddress || ""}
                onChange={(e) =>
                  setForm({ ...form, walletAddress: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Initial Balance</Label>
              <Input
                type="number"
                value={form.balance || ""}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.status || "active"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="pt-2 border-t font-medium text-sm">
              Payment Gateway Credentials
            </div>
            {["merchantId", "storeId", "apiKey", "apiSecret"].map((k) => (
              <Input
                key={k}
                placeholder={k}
                value={form.credentials?.[k] || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    credentials: { ...form.credentials, [k]: e.target.value },
                  })
                }
                className="mt-2"
              />
            ))}
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={form.credentials?.sandbox ?? true}
                onChange={(e) =>
                  setForm({
                    ...form,
                    credentials: {
                      ...form.credentials,
                      sandbox: e.target.checked,
                    },
                  })
                }
              />
              Sandbox Mode
            </label>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => runAction("POST", form)}
            >
              {isPending ? "Creating..." : "Create Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
        
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => runAction("DELETE", { id: selected?._id })}
              className="bg-red-600"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
