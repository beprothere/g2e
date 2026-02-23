"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Edit2, Plus, Trash2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { savePlanAction, deletePlanAction } from "@/app/actions/plan-actions";

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

export function PlanSettingsClient({ initialPlans }: { initialPlans: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // For Confirmation Modal

  const startEdit = (plan: any) => {
    setEditingId(plan._id);
    setForm({ ...plan, descriptions: plan.descriptions || ["", ""] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await deletePlanAction(deleteId);
    if (res.success) {
      toast.success("Plan deleted successfully");
      setDeleteId(null);
    } else {
      toast.error("Failed to delete");
    }
  };

  const savePlan = async () => {
    if (!form) return;
    const res = await savePlanAction(form, editingId === "new");
    if (res.success) {
      toast.success(`Plan saved successfully`);
      cancelEdit();
    } else {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      {/* --- Confirmation Modal --- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Delete Plan?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Bhai, kya aap waqai is plan ko delete karna chahte hain? Yeh action wapis nahi ho sakega.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmDelete}>
                Yes, Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="rounded-2xl overflow-hidden relative">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Investment Plans</h2>
          <p className="text-sm text-muted-foreground">Configure plan settings and ROI</p>
        </div>

        <div className="divide-y divide-border">
          {initialPlans.map((plan) => (
            <div key={plan._id} className="p-6">
              {renderPlanCard(plan, editingId === plan._id)}
            </div>
          ))}

          {editingId === "new" && form && (
            <div className="p-6">{renderPlanCard(form, true, true)}</div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted/30">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-transparent" 
            onClick={() => {
              setEditingId("new");
              setForm({
                name: "", price: "", refsRequired: "", commission: "",
                roi: "", duration: "", descriptions: ["", ""], status: "active",
              });
            }}
          >
            + Add New Plan
          </Button>
        </div>
      </Card>
    </>
  );

  function renderPlanCard(plan: any, isEditing: boolean, isNew = false) {
    const data = isEditing && form ? form : plan;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <Input
                placeholder="Plan Name"
                className="h-9 mb-2"
                value={data.name}
                onChange={(e) => setForm({ ...form!, name: e.target.value })}
              />
            ) : (
              <p className="font-semibold text-foreground">{data.name} Plan</p>
            )}
            <div className="text-sm text-muted-foreground">
              $ {isEditing ? (
                <Input
                  type="number"
                  className="inline w-20 h-7 ml-1"
                  value={data.price}
                  onChange={(e) => setForm({ ...form!, price: Number(e.target.value) })}
                />
              ) : data.price} investment
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Action Icons Next to Switch */}
            {isEditing && (
              <div className="flex items-center gap-2">
                 <button 
                  onClick={cancelEdit} 
                  title="Cancel Edit"
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                 >
                    <XCircle className="h-5 w-5" />
                 </button>
                 {!isNew && (
                   <button 
                    onClick={() => setDeleteId(plan._id)} 
                    title="Delete Plan"
                    className="p-1 text-destructive/70 hover:text-destructive transition-colors"
                   >
                      <Trash2 className="h-5 w-5" />
                   </button>
                 )}
              </div>
            )}
            
            {!isEditing && (
              <Badge className={data.status === "active" ? "bg-secondary/20 text-secondary border-0" : "bg-muted/20 text-muted-foreground border-0"}>
                {data.status === "active" ? "Active" : "Inactive"}
              </Badge>
            )}

            <Switch
              checked={data.status === "active"}
              disabled={!isEditing}
              onCheckedChange={(v) => setForm({ ...form!, status: v ? "active" : "inactive" })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Refs Required", "refsRequired", "bg-muted/30"],
            ["Commission", "commission", "bg-primary/5", "%"],
            ["ROI", "roi", "bg-secondary/5", "%"],
            ["Duration", "duration", "bg-accent/5", " days"],
          ].map(([label, key, bg, suffix = ""]) => (
            <div key={key} className={`p-3 rounded-lg ${bg}`}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              {isEditing ? (
                <Input
                  type="number"
                  className="h-8"
                  value={data[key as keyof PlanForm] as any}
                  onChange={(e) => setForm({ ...form!, [key]: Number(e.target.value) })}
                />
              ) : (
                <p className="font-semibold">{data[key as keyof PlanForm]}{suffix}</p>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-medium text-muted-foreground">Plan Descriptions</p>
            {data.descriptions.map((d: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input
                  maxLength={60}
                  placeholder={`Line ${i + 1}`}
                  className="h-9"
                  value={d}
                  onChange={(e) => {
                    const arr = [...data.descriptions];
                    arr[i] = e.target.value;
                    setForm({ ...form!, descriptions: arr });
                  }}
                />
                <Button 
                  variant="ghost" size="icon" className="h-9 w-9 shrink-0"
                  onClick={() => {
                    const arr = data.descriptions.filter((_:any, index:number) => index !== i);
                    setForm({...form!, descriptions: arr});
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setForm({ ...form!, descriptions: [...data.descriptions, ""] })}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Line
              </Button>
            </div>
            <Button size="sm" className="w-full mt-4" onClick={savePlan}>
              {isNew ? "Create & Save" : "Update & Save"}
            </Button>
          </div>
        )}

        {!isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2 bg-transparent border-dashed hover:border-solid transition-all" 
            onClick={() => startEdit(plan)}
          >
            <Edit2 className="h-4 w-4" /> Edit Plan
          </Button>
        )}
      </div>
    );
  }
}
