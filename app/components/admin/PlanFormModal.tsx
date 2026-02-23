"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function PlanFormModal({
  open,
  onClose,
  initialData,
  onSaved,
}: any) {
  const [form, setForm] = useState<any>({
    name: "",
    price: "",
    refsRequired: "",
    commission: "",
    roi: "",
    duration: "",
    descriptions: ["", ""],
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        price: initialData.price,
        refsRequired: initialData.refsRequired,
        commission: initialData.commission,
        roi: initialData.roi,
        duration: initialData.duration,
        descriptions: initialData.descriptions || ["", ""],
        status: initialData.status,
      });
    } else {
      setForm({
        name: "",
        price: "",
        refsRequired: "",
        commission: "",
        roi: "",
        duration: "",
        descriptions: ["", ""],
        status: "active",
      });
    }
  }, [initialData]);

  const savePlan = async () => {
    const res = await fetch("/api/admin/plans", {
      method: initialData ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        initialData ? { ...form, id: initialData._id } : form
      ),
    });

    if (res.ok) {
      onSaved(form.name, !initialData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Other Fields" : "Add New Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Plan Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Plan Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Refs Required"
            value={form.refsRequired}
            onChange={(e) =>
              setForm({ ...form, refsRequired: e.target.value })
            }
          />

          <Input
            type="number"
            placeholder="Commission %"
            value={form.commission}
            onChange={(e) =>
              setForm({ ...form, commission: e.target.value })
            }
          />

          <Input
            type="number"
            placeholder="ROI %"
            value={form.roi}
            onChange={(e) => setForm({ ...form, roi: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Duration (days)"
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: e.target.value })
            }
          />

          {form.descriptions.map((d: string, i: number) => (
            <Input
              key={i}
              maxLength={60}
              placeholder={`Description line ${i + 1}`}
              value={d}
              onChange={(e) => {
                const arr = [...form.descriptions];
                arr[i] = e.target.value;
                setForm({ ...form, descriptions: arr });
              }}
            />
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                descriptions: [...form.descriptions, ""],
              })
            }
          >
            + Add new line
          </Button>

          <div className="flex items-center justify-between">
            <span>Status</span>
            <Switch
              checked={form.status === "active"}
              onCheckedChange={(v) =>
                setForm({ ...form, status: v ? "active" : "inactive" })
              }
            />
          </div>

          <Button className="w-full" onClick={savePlan}>
            {initialData ? "Update & Save" : "Create Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
