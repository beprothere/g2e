"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="p-6 max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="text-sm text-foreground/70">{message}</div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  );
}
