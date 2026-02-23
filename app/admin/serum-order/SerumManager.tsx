"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { manageSerumAction } from "@/app/actions/serum-actions";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SerumManager({
  initialSerums = [],
}: {
  initialSerums?: any[];
}) {
  const [serums] = useState(initialSerums || []);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const res = await manageSerumAction(deleteId, null, "DELETE");
    if (res.success) {
      toast.success("Serum deleted!");
      setDeleteId(null);
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="py-6 w-full space-y-6">
      <div className="flex w-full justify-between items-center bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serum Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product list and features
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="rounded-xl gap-2 font-bold px-6 h-11"
        >
          <Plus size={18} /> Add New Serum
        </Button>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {serums.length > 0 ? (
          serums.map((serum) => (
            <SerumListCard
              key={serum._id}
              serum={serum}
              setDeleteId={setDeleteId}
            />
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground">
            No serums added yet.
          </div>
        )}
      </div>

      {showCreate && (
        <SerumModal mode="create" onClose={() => setShowCreate(false)} />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="z-1001 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              Delete Serum?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to remove this item? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-xl flex-1"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Confirm Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SerumListCard({
  serum,
  setDeleteId,
}: {
  serum: any;
  setDeleteId: (id: string) => void;
}) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden rounded-2xl py-2 border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4 p-4">
          <div className="relative h-20 w-20 md:h-25 md:w-25 shrink-0 bg-muted/50 rounded-xl overflow-hidden border border-border/50">
            <img
              src={serum.serumPic}
              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110 rounded-xl"
              alt={serum.serumName}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h3 className="text-xl font-bold truncate">{serum.serumName}</h3>
              <div className="flex gap-1.5 justify-center md:justify-start">
                {serum.serumaboutline?.map((line: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md uppercase"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
              {serum.description}
            </p>
          </div>

          <div className="flex md:flex-col gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border hover:scale-110 hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setShowEdit(true)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border hover:scale-110 hover:text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => setDeleteId(serum._id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {showEdit && (
        <SerumModal
          mode="edit"
          initialData={serum}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}

function SerumModal({
  mode,
  initialData,
  onClose,
}: {
  mode: "create" | "edit";
  initialData?: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    initialData || {
      serumName: "",
      description: "",
      serumPic: "",
      serumaboutline: [""],
    },
  );
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/"))
        return toast.error("Please select an image file!");
      const reader = new FileReader();
      reader.onload = () =>
        setForm({ ...form, serumPic: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addLine = () => {
    if (form.serumaboutline.length < 3)
      setForm({ ...form, serumaboutline: [...form.serumaboutline, ""] });
    else toast.error("Maximum 3 points allowed");
  };

  const removeLine = (index: number) => {
    if (form.serumaboutline.length > 1) {
      setForm({
        ...form,
        serumaboutline: form.serumaboutline.filter(
          (_: any, i: number) => i !== index,
        ),
      });
    }
  };

  const submit = async () => {
    if (
      !form.serumName ||
      !form.serumPic ||
      form.serumaboutline.some((l: string) => !l)
    ) {
      return toast.error("Please fill all fields!");
    }
    setLoading(true);
    const res = await manageSerumAction(
      mode === "edit" ? form._id : null,
      form,
      mode === "edit" ? "PUT" : "POST",
    );
    if (res.success) {
      toast.success(mode === "edit" ? "Changes Saved!" : "Serum Added!");
      onClose();
      window.location.reload();
    }
    setLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      <Card className="relative w-full max-w-lg bg-card border-none shadow-2xl p-8 rounded-xl animate-in zoom-in-95 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">
            {mode === "create" ? "Add Serum" : "Edit Serum"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="relative h-32 w-32 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-muted/20">
              {form.serumPic ? (
                <img
                  src={form.serumPic}
                  className="h-full w-full object-contain p-2"
                  alt="Serum preview"
                />
              ) : (
                <ImageIcon className="text-muted-foreground" size={28} />
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFile}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
                Serum Name
              </label>
              <Input
                className="h-11 rounded-xl bg-muted/50 border-none font-semibold"
                placeholder="Product Name"
                value={form.serumName}
                onChange={(e) =>
                  setForm({ ...form, serumName: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
                Description
              </label>
              <Textarea
                className="min-h-20 rounded-xl bg-muted/50 border-none resize-none text-sm"
                placeholder="Write description..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* About Lines Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
              Key Features (About Lines)
            </label>
            {form.serumaboutline.map((line: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="h-10 rounded-xl bg-muted/30 border-none text-sm font-medium"
                  value={line}
                  placeholder={`Feature ${i + 1}`}
                  onChange={(e) => {
                    const newLines = [...form.serumaboutline];
                    newLines[i] = e.target.value;
                    setForm({ ...form, serumaboutline: newLines });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-red-500"
                  onClick={() => removeLine(i)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            {form.serumaboutline.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-dashed py-5 border-primary/30 text-primary"
                onClick={addLine}
              >
                + Add Feature Point
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl h-12 font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl h-12 font-bold bg-primary shadow-lg shadow-primary/20"
            onClick={submit}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save Serum"}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
