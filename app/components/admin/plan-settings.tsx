"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Edit2, Plus } from "lucide-react";
import toast from "react-hot-toast";

type PlanForm = {
  _id?: string;
  name: string;
  price: number | "";
  refsRequired: number | "";
  commission: number | "";
  roi: number | "";
  duration: number | "";
  descriptions: string[];
  status: "active" | "inactive";
};

export function PlanSettings() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm | null>(null);
  const firstLoad = useRef(true);

  const fetchPlans = async () => {
    const res = await fetch("/api/admin/plans", { cache: "no-store" });
    const data = await res.json();

    if (data.success) setPlans(data.plans);

    if (firstLoad.current) {
      setLoading(false);
      firstLoad.current = false;
    }
  };

  useEffect(() => {
    fetchPlans();
    const i = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPlans();
      }
    }, 45000);
    return () => clearInterval(i);
  }, []);

  const startEdit = (plan: any) => {
    setEditingId(plan._id);
    setForm({
      _id: plan._id,
      name: plan.name,
      price: plan.price,
      refsRequired: plan.refsRequired,
      commission: plan.commission,
      roi: plan.roi,
      duration: plan.duration,
      descriptions: plan.descriptions || ["", ""],
      status: plan.status,
    });
  };

  const startCreate = () => {
    setEditingId("new");
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
  };

  const savePlan = async () => {
    if (!form) return;

    const isNew = editingId === "new";

    const res = await fetch("/api/admin/plans", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew ? form : { ...form, id: form._id }),
    });

    if (res.ok) {
      toast.success(
        `Plan "${form.name}" has been ${
          isNew ? "created" : "updated"
        } successfully`,
      );

      setEditingId(null);
      setForm(null);
      fetchPlans();
    } else {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Investment Plans</h2>
        <p className="text-sm text-muted-foreground">
          Configure plan settings and ROI
        </p>
      </div>

      <div className="divide-y divide-border">
        {loading && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading plans...
          </div>
        )}

        {!loading &&
          plans.map((plan) => {
            const isEditing = editingId === plan._id;

            return (
              <div key={plan._id} className="p-6">
                {renderPlanCard(plan, isEditing)}
              </div>
            );
          })}

        {editingId === "new" && form && (
          <div className="p-6">{renderPlanCard(form, true, true)}</div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent"
          onClick={startCreate}
        >
          + Add New Plan
        </Button>
      </div>
    </Card>
  );

  function renderPlanCard(plan: any, isEditing: boolean, isNew = false) {
    const data = isEditing && form ? form : plan;

    return (
      <div>
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-semibold">
              {isEditing ? (
                <Input
                  placeholder="Plan Name"
                  value={data.name}
                  onChange={(e) => setForm({ ...form!, name: e.target.value })}
                />
              ) : (
                `${data.name} Plan`
              )}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              $
              {isEditing ? (
                <Input
                  type="number"
                  className="inline w-24 ml-1"
                  value={data.price}
                  onChange={(e) =>
                    setForm({ ...form!, price: Number(e.target.value) })
                  }
                />
              ) : (
                data.price
              )}{" "}
              investment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={data.status === "active"}
              onCheckedChange={(v) =>
                setForm({ ...form!, status: v ? "active" : "inactive" })
              }
            />

            <Badge
              className={
                data.status === "active"
                  ? "bg-secondary/20 text-secondary border-0"
                  : "bg-muted/20 text-muted-foreground border-0"
              }
            >
              {data.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {[
            ["Refs Required", "refsRequired", "bg-muted/30"],
            ["Commission", "commission", "bg-primary/5", "%"],
            ["ROI", "roi", "bg-secondary/5", "%"],
            ["Duration", "duration", "bg-accent/5", " days"],
          ].map(([label, key, bg, suffix = ""]) => (
            <div key={key} className={`p-3 rounded-lg ${bg}`}>
              <p className="text-xs text-muted-foreground">{label}</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={data[key]}
                  onChange={(e) =>
                    setForm({ ...form!, [key]: Number(e.target.value) })
                  }
                />
              ) : (
                <p className="font-semibold">
                  {data[key]}
                  {suffix}
                </p>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="space-y-2 mb-4">
            {data.descriptions.map((d: string, i: number) => (
              <Input
                key={i}
                maxLength={60}
                placeholder={`Description line ${i + 1}`}
                value={d}
                onChange={(e) => {
                  const arr = [...data.descriptions];
                  arr[i] = e.target.value;
                  setForm({ ...form!, descriptions: arr });
                }}
              />
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setForm({
                  ...form!,
                  descriptions: [...data.descriptions, ""],
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add new line
            </Button>
          </div>
        )}

        {isEditing && (
          <Button size="sm" className="w-full" onClick={savePlan}>
            {isNew ? "Create & Save" : "Update & Save"}
          </Button>
        )}

        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 bg-transparent"
            onClick={() => startEdit(plan)}
          >
            <Edit2 className="h-4 w-4" />
            Edit Plan
          </Button>
        )}
      </div>
    );
  }
}
