"use client";

import { useState, useTransition } from "react";
import { handleManualWalletAction } from "@/app/admin/wallets/actions";
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
import { Plus, Wallet, Copy, Check, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function ManualWallets({ initialWallets }: { initialWallets: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTilId, setCopiedTilId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const copyNumber = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Number Copied");
    setTimeout(() => setCopiedId(null), 1200);
  };

  const handleQrUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev: any) => ({
        ...prev,
        qrPic: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const copyTilId = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTilId(id);
    toast.success("IBAN Copied");
    setTimeout(() => setCopiedTilId(null), 1200);
  };

  const statusStyle = (s: string) => {
    if (s === "active") return "bg-green-100 text-green-700";
    if (s === "inactive") return "bg-pink-200 text-pink-600";
    return "bg-red-100 text-red-600";
  };

  const runAction = (method: "POST" | "PUT" | "DELETE", data?: any) => {
    startTransition(async () => {
      const res = await handleManualWalletAction(data, method);
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
          <h1 className="text-3xl font-bold text-foreground">
            Manual Wallet Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Add and manage manual wallets for testing and operations
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({});
            setAddOpen(true);
          }}
          className="gap-2 w-full lg:w-fit"
        >
          <Plus className="h-4 w-4" /> Add Manual Wallet
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

              <div className="mt-3 flex flex-col">
                <p className="text-xs text-muted-foreground">Holder Name</p>
                {editing ? (
                  <Input
                    value={form.holderName}
                    onChange={(e) =>
                      setForm({ ...form, holderName: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex gap-2 mt-1">
                    <code className="text-sm flex-1 truncate">
                      {w.holderName}
                    </code>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Wallet Number</p>
                {editing ? (
                  <Input
                    value={form.walletNumber}
                    type="number"
                    maxLength={11}
                    minLength={11}
                    onChange={(e) =>
                      setForm({ ...form, walletNumber: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">
                      {w.walletNumber}
                    </code>
                    <button onClick={() => copyNumber(w.walletNumber, w._id)}>
                      {copiedId === w._id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Signup Balance</p>
                {editing ? (
                  <Input
                    value={form.signupBalance}
                    type="number"
                    maxLength={50}
                    onChange={(e) =>
                      setForm({ ...form, signupBalance: e.target.value })
                    }
                  />
                ) : (
                  <div className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">
                    {w.signupBalance}
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Wallet IBAN</p>
                {editing ? (
                  <Input
                    value={form.walletTilId}
                    onChange={(e) =>
                      setForm({ ...form, walletTilId: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">
                      {w.walletTilId}
                    </code>
                    <button onClick={() => copyTilId(w.walletTilId, w._id)}>
                      {copiedTilId === w._id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">QR Code</p>

                {editing ? (
                  <>
                    {form.qrPic && (
                      <img
                        src={form.qrPic}
                        alt="QR Preview"
                        className="w-24 h-24 object-contain border rounded-md"
                      />
                    )}

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleQrUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </>
                ) : (
                  w.qrPic && (
                    <img
                      src={w.qrPic}
                      alt="QR"
                      className="w-20 h-20 object-contain border rounded-md"
                    />
                  )
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

              <div className="flex gap-2 mt-4">
                {editing ? (
                  <>
                    <Button
                      disabled={isPending}
                      className="flex-1"
                      onClick={() => runAction("PUT", { ...form, id: w._id })}
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
            <DialogTitle>Add Manual Wallet</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label>Wallet Name</Label>
              <Input
                value={form.walletName || ""}
                type="text"
                maxLength={50}
                placeholder="e.g. Test Wallet 1"
                onChange={(e) =>
                  setForm({ ...form, walletName: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Signup Balance</Label>
              <Input
                value={form.signupBalance || ""}
                type="number"
                maxLength={50}
                placeholder="e.g. 5000"
                onChange={(e) =>
                  setForm({ ...form, signupBalance: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
              <Label>Holder Name</Label>
              <Input
                value={form.holderName || ""}
                type="text"
                maxLength={100}
                placeholder="e.g. John Doe"
                onChange={(e) =>
                  setForm({ ...form, holderName: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Wallet Number</Label>
              <Input
                value={form.walletNumber || ""}
                type="number"
                maxLength={11}
                minLength={11}
                placeholder="03123456789"
                onChange={(e) =>
                  setForm({ ...form, walletNumber: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Wallet IBAN</Label>
              <Input
                value={form.walletTilId || ""}
                type="text"
                maxLength={60}
                minLength={6}
                placeholder="IBANHLM12345678"
                onChange={(e) =>
                  setForm({ ...form, walletTilId: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>QR Code</Label>

              {form.qrPic && (
                <img
                  src={form.qrPic}
                  alt="QR Preview"
                  className="w-32 h-32 object-contain border rounded-md"
                />
              )}

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleQrUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
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
