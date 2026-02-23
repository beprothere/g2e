"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Eye, X } from "lucide-react";
import { useState } from "react";

export function InvestmentDetailsModal({ data, onClose }: any) {
  const [openRecipet, setOpenRecipet] = useState(false);
  const statusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-accent/20 text-accent border-0">Pending</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-primary/20 text-primary border-0">
            In Progress
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-0">
            Rejected
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-secondary/20 text-secondary border-0">
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl sm:max-w-2xl rounded-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Investment Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            USER INFORMATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">{data.userName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{data.user?.email || "-"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="font-mono text-xs text-muted-foreground">
                {data.userId}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Account Status</p>
              <Badge variant="outline">
                {data.user?.accountstatus || "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            PLAN INFORMATION
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <Badge className="bg-primary/10 text-primary border-0">
                {data.plan}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="font-semibold">${data.amount}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              {statusBadge(data.status)}
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Refs Required</p>
              <p className="font-medium">{data.refsRequired}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Commission</p>
              <p className="font-medium">{data.commission}%</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className="font-medium">{data.roiPercentage}%</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            TRANSACTION DETAILS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-xs">{data.id}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="font-medium">{data?.method || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Transaction Date</p>
              <p className="font-medium">
                {new Date(data.date).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">View Receipt</p>
              <div className="relative w-40 h-40">
                <Image
                  src={data.receipt}
                  width={400}
                  height={400}
                  alt="Receipt Image"
                  className="rounded-sm border w-full h-full"
                />
                <span className="viewicon-image-box bg-black/40 cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-sm" onClick={() => setOpenRecipet(true)}>
                  <Eye size={20} className="text-white cursor-pointer" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {openRecipet && (
          <div className="absolute bg-black/30 p-4 rounded-md w-full h-full flex items-center justify-center" onClick={() => setOpenRecipet(false)}>
            <Image
              src={data.receipt}
              alt="recep-image"
              width={200}
              height={200}
              className="w-1/2 h-auto object-contain"
            />

            <X size={18} className="absolute top-4 right-3.75" onClick={() => setOpenRecipet(false)} />
          </div>
        )}

        <Separator />

        <Button className="w-full mt-2" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
