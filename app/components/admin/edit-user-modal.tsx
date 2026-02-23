"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { updateUserAction } from "@/app/actions/user-actions";

const STATUSES = [
  {
    label: "Pending",
    value: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    label: "Verified",
    value: "Verified",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    label: "Blocked",
    value: "Blocked",
    color: "bg-red-100 text-red-700 border-red-300",
  },
];

export function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    country: user.country || "",
    depositBalance: user.depositBalance || 0,
    availableWithdraw: user.availableWithdraw || 0,
    commissionRate: user.commissionRate || 0,
    status: user.status || "Pending",
    avatar: user.avatar || "",
  });

  const [preview, setPreview] = useState(user.avatar || "/img/avatar.png");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setForm((prev) => ({ ...prev, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    try {
      setLoading(true);
      const result = await updateUserAction(user._id, form, user);

      if (result.success) {
        toast.success("Profile and Notifications processed!");
        onUpdated();
        onClose();
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (err: any) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-999 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl border-border bg-card">
        <div className="flex items-center gap-4 mb-6">
          <label className="relative cursor-pointer group">
            <img
              src={preview}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-all"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleAvatarChange(e.target.files[0])
              }
            />
            <span className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
              EDIT
            </span>
          </label>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Edit User Profile
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage account balance and personal details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Full Name">
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="Email Address">
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone Number">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Commission Rate (%)">
            <Input
              type="number"
              value={form.commissionRate}
              onChange={(e) =>
                setForm({ ...form, commissionRate: +e.target.value })
              }
            />
          </Field>
          <Field label="Deposit Balance ($)">
            <Input
              type="number"
              value={form.depositBalance}
              onChange={(e) =>
                setForm({ ...form, depositBalance: +e.target.value })
              }
            />
          </Field>
          <Field label="Available Withdraw ($)">
            <Input
              type="number"
              value={form.availableWithdraw}
              onChange={(e) =>
                setForm({ ...form, availableWithdraw: +e.target.value })
              }
            />
          </Field>
          <Field label="Home Address" full>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="City">
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label="Country">
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-6">
          <label className="text-sm font-semibold mb-3 block text-foreground">
            Account Status
          </label>
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((s) => {
              const active = form.status === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: s.value })}
                  className={`px-6 py-2 rounded-xl border-2 transition-all text-sm font-bold
                    ${active ? `${s.color} scale-105 shadow-md` : "border-transparent bg-muted text-muted-foreground hover:bg-secondary"}
                  `}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={save} disabled={loading} className="px-8 font-bold">
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
