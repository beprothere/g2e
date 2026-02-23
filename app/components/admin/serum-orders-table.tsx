"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, SearchX } from "lucide-react";
import toast from "react-hot-toast";

import { updateSerumOrderAction } from "@/app/actions/serumActions"; 

export function SerumOrderTable({
  initialOrders,
  total,
  pages,
  filters,
  onPageChange,
}: {
  initialOrders: any[];
  total: number;
  pages: number;
  filters: any;
  onPageChange: (page: number) => void;
}) {
  const [orders, setOrders] = useState(initialOrders);
  
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const hasData = orders && orders.length > 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serum Orders Table</h2>
          <p className="text-muted-foreground text-sm">
            Monitor and manage your shipments and delivery status.
          </p>
        </div>
        {hasData && (
          <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold border border-primary/20">
            Total Records: {total}
          </div>
        )}
      </div>

      <div className="overflow-x-auto min-h-75">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-y">
            <tr>
              <th className="p-4 text-left font-semibold">Serum Detail</th>
              <th className="p-4 text-center font-semibold">Order ID</th>
              <th className="p-4 text-center font-semibold">Customer</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Tracking Number</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {hasData ? (
              orders.map((order) => (
                <SerumRow 
                  key={order._id} 
                  order={order} 
                  onUpdated={(updated) => 
                    setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
                  } 
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                      <SearchX className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-foreground">No data found</h3>
                      <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                        Sorry, we couldn't find any orders matching your selected filters or search terms.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                      onClick={() => window.location.href = window.location.pathname}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasData && (
        <div className="flex items-center justify-between pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-foreground">{(filters.page - 1) * filters.limit + 1}</span> to{" "}
            <span className="font-bold text-foreground">{Math.min(filters.page * filters.limit, total)}</span> of{" "}
            <span className="font-bold text-foreground">{total}</span> orders
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="font-semibold shadow-sm"
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-semibold shadow-sm"
              disabled={filters.page >= pages}
              onClick={() => onPageChange(filters.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SerumRow({ order, onUpdated }: { order: any; onUpdated: (o: any) => void }) {
  const [edit, setEdit] = useState(false);
  const [status, setStatus] = useState<string>(order.status);
  const [tracking, setTracking] = useState<string>(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      const res = await updateSerumOrderAction({ 
      orderId: order._id, 
      status: status, 
      trackingNumber: tracking 
    });
      
      if (!res.success) throw new Error(res.error);

      toast.success("Order Updated");
      setEdit(false);
      onUpdated(res.order);
    } catch (err) {
      toast.error("Update Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="p-4 flex items-center gap-4">
        <img 
          src={order.serumPic || "/img/serum.png"} 
          className="w-12 h-12 rounded-lg border object-cover shadow-sm" 
          alt="serum"
        />
        <span className="font-bold text-foreground">{order.serumName}</span>
      </td>

      <td className="p-4 text-center text-xs font-mono text-muted-foreground">
        SERM-{order._id.slice(-6).toUpperCase()}
      </td>

      <td className="p-4 text-center">
        <div className="font-semibold">{order.fullName}</div>
        <div className="text-[11px] text-muted-foreground">{order.email}</div>
      </td>

      <td className="p-4 text-center">
        {edit ? (
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="border rounded-md px-2 py-1 text-xs focus:ring-2 ring-primary outline-none"
          >
            <option value="processing">Processing</option>
            <option value="dispatched">Dispatched</option>
            <option value="received">Received</option>
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
            order.status === 'received' ? 'bg-green-100 text-green-700' : 
            order.status === 'dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {order.status}
          </span>
        )}
      </td>

      <td className="p-4 text-center">
        {edit ? (
          <input 
            value={tracking} 
            onChange={(e) => setTracking(e.target.value)} 
            placeholder="Tracking #"
            className="border rounded-md px-2 py-1 text-xs w-32 focus:ring-2 ring-primary outline-none" 
          />
        ) : (
          <span className="text-muted-foreground italic">{order.trackingNumber || "N/A"}</span>
        )}
      </td>

      <td className="p-4 text-center">
        {edit ? (
          <div className="flex justify-center gap-3">
            <button onClick={save} disabled={saving} className="hover:scale-125 transition-transform">
              <Check className={`w-5 h-5 ${saving ? 'text-gray-400 animate-pulse' : 'text-green-600'}`} />
            </button>
            <button onClick={() => setEdit(false)} className="hover:scale-125 transition-transform">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEdit(true)} className="hover:text-primary transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}