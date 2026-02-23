"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import { updateDepositStatus } from "@/app/admin/deposits/actions"; // Import Action
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DepositDetailsModal } from "./DepositDetailsModal";
import toast from "react-hot-toast";

export function DepositsTable({ initialData, total, page }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<any | null>(null);

  const handleUpdate = (id: string, action: "approve" | "reject") => {
    startTransition(async () => {
      const res = await updateDepositStatus(id, action);
      if (res.success) {
        toast.success(`Deposit ${action}ed successfully`);
        setSelected(null);
      } else {
        toast.error("Failed to update deposit");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-accent/20 text-accent",
      approved: "bg-secondary/20 text-secondary",
      rejected: "bg-destructive/20 text-destructive",
    };
    return <Badge className={`${styles[status]} border-0 capitalize`}>{status}</Badge>;
  };

  return (
    <Card className={`rounded-2xl overflow-hidden ${isPending ? "opacity-50" : ""}`}>
      {/* ... Table Header Same ... */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr className="text-left font-semibold">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((dep: any) => (
              <tr key={dep._id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{dep.id}</td>
                <td className="px-6 py-4 font-medium">{dep.user}</td>
                <td className="px-6 py-4 text-right font-bold text-secondary">+${dep.amount}</td>
                <td className="px-6 py-4"><Badge variant="outline">{dep.method}</Badge></td>
                <td className="px-6 py-4">{getStatusBadge(dep.status)}</td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{dep.date}</td>
                <td className="px-6 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Open actions menu"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelected(dep)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                      {dep.status === "pending" && (
                        <>
                          <DropdownMenuItem className="text-secondary" onClick={() => handleUpdate(dep._id, "approve")}><CheckCircle className="mr-2 h-4 w-4" /> Approve</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleUpdate(dep._id, "reject")}><XCircle className="mr-2 h-4 w-4" /> Reject</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination using router.push */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">Showing {(page - 1) * 5 + 1} to {Math.min(page * 5, total)} of {total}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => router.push(`?page=${page - 1}`)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 5 >= total} onClick={() => router.push(`?page=${page + 1}`)}>Next</Button>
        </div>
      </div>

      {selected && (
        <DepositDetailsModal
          open={!!selected}
          deposit={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleUpdate(selected._id, "approve")}
          onReject={() => handleUpdate(selected._id, "reject")}
        />
      )}
    </Card>
  );
}
