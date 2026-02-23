"use client";

import Image from "next/image";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  confirmSerumOrderAction,
  markAsReceivedAction,
} from "@/app/actions/serum-user-actions";

interface SerumProps {
  initialOrder: any;
  catalogData: any;
}

export default function Serum({ initialOrder, catalogData }: SerumProps) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [actionLoading, setActionLoading] = useState(false);

  if (!catalogData && !order) {
    return (
      <Card className="p-6 flex items-center justify-center text-muted-foreground bg-muted/20 border-dashed border-2 rounded-2xl">
        <p className="font-bold">No serums available at the moment.</p>
      </Card>
    );
  }

  const confirmOrder = async () => {
    if (!catalogData) return toast.error("Serum info missing!");

    try {
      setActionLoading(true);
      const res = await confirmSerumOrderAction(catalogData);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      setOrder(res.order);
      toast.success("✅ Serum order confirmed successfully!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const markAsReceived = async () => {
    try {
      setActionLoading(true);
      const res = await markAsReceivedAction(order._id);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      setOrder({ ...order, status: "received" });
      toast.success("📦 Order marked as received!");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="p-6 border-primary/20 glass overflow-hidden relative shadow-xl">
      {!order ? (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-3 flex-1">
              <div className="space-y-1">
                <h3 className="font-black text-2xl text-primary uppercase leading-none tracking-tighter">
                  {catalogData.serumName}
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Premium Collection
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {catalogData.serumaboutline?.map((line: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg uppercase"
                  >
                    {line}
                  </span>
                ))}
              </div>

              <p className="text-xs text-foreground/70 leading-relaxed font-medium line-clamp-3">
                {catalogData.description}
              </p>
            </div>

            <div className="relative w-36 h-36 shrink-0 bg-white dark:bg-black/20 rounded-2xl p-3 border border-primary/10 shadow-inner">
              <Image
                src={catalogData.serumPic}
                fill
                alt="Serum Product"
                className="rounded-lg object-contain p-1 w-20 lg:w-25"
              />
            </div>
          </div>

          <Button
            onClick={confirmOrder}
            disabled={actionLoading}
            className="w-full h-12 rounded-xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {actionLoading ? "Processing Order..." : "Claim Your Free Serum"}
          </Button>
        </div>
      ) : (
        <div className="border-2 rounded-2xl p-5 bg-green-500/5 border-green-500/20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xl text-green-700 tracking-tight">
              {order.serumName}
            </h3>
            <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full">
              <span className="text-[10px] uppercase font-black tracking-widest">
                {order.status}
              </span>
            </div>
          </div>

          <div className="flex lg:gap-5 gap-1 items-center bg-white/60 dark:bg-black/20 lg:p-4 p-2 lg:shadow-none shadow-lg shadow-primary/20 rounded-2xl border border-green-500/10">
            <div className="relative w-15 lg:w-20 h-10 lg:h-20 shrink-0">
              <Image
                src={catalogData.serumPic}
                fill
                alt="Serum"
                className="object-contain w-full h-full rounded-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="lg:text-[10px] text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                Tracking Details
              </p>
              <p className="lg:text-[10px] text-[8px] font-mono font-black text-primary bg-primary/5 px-2 py-1 rounded-md">
                {order.trackingNumber}
              </p>
              <p className="lg:text-[10px] text-[8px] text-gray-400 font-bold mt-1">
                📅 Ordered: {new Date(order.createdAt).toDateString()}
              </p>
            </div>
          </div>

          {order.status !== "received" && (
            <Button
              onClick={markAsReceived}
              disabled={actionLoading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-lg shadow-lg shadow-green-600/20"
            >
              {actionLoading ? "Updating Status..." : "Mark as Received ✅"}
            </Button>
          )}

          {order.status === "received" && (
            <div className="text-center py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <p className="text-green-700 dark:text-green-400 font-black text-sm uppercase tracking-widest">
                Product Delivered ✨
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
