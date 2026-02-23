"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, CheckCircle, XCircle, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DepositDetailsModal } from "./DepositDetailsModal";
import { updateDepositStatus } from "@/app/admin/deposits/actions";
import toast from "react-hot-toast";

export function DepositsTable({ initialData, total, page, onPageChange }: any) {
  const [selected, setSelected] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [displayData, setDisplayData] = useState(initialData);

  useEffect(() => {
    setDisplayData(initialData);
  }, [initialData]);

  const handleUpdate = (id: string, action: "approve" | "reject") => {
    startTransition(async () => {
      const res = await updateDepositStatus(id, action);
      if (res.success) {
        toast.success(
          `Deposit ${action === "approve" ? "Approved" : "Rejected"}`,
        );
        
        setDisplayData((prev: any) => prev.filter((item: any) => item._id !== id));
        
        setSelected(null);
        router.refresh();
      } else {
        toast.error(res.message || "Something went wrong");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-accent/20 text-accent",
      approved: "bg-secondary/20 text-secondary",
      rejected: "bg-destructive/20 text-destructive",
      flagged: "bg-destructive/20 text-destructive",
    };
    return (
      <Badge className={`${styles[status] || ""} border-0 capitalize`}>
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Card
        className={`rounded-2xl overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Deposit Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review screenshots and approve deposits
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
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
              {displayData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                      <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
                        <SearchX size={48} className="text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        No records found
                      </h3>
                      <p className="text-gray-400 text-sm max-w-sm mt-2 font-medium">
                        No Deposit requests found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((dep: any) => (
                  <tr
                    key={dep._id}
                    className="border-b border-border hover:bg-muted/30 transition-colors last:border-0"
                  >
                    <td
                      className="px-6 py-4 font-mono text-xs text-muted-foreground cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(dep.fullId);
                        toast.success("ID Copied");
                      }}
                    >
                      {dep.id}
                    </td>
                    <td className="px-6 py-4 font-medium">{dep.user}</td>
                    <td className="px-6 py-4 text-right font-bold text-secondary">
                      +${dep.amount}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="border-0 bg-primary/10 text-primary"
                      >
                        {dep.method}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(dep.status)}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {dep.date}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => setSelected(dep)}
                            className="cursor-pointer gap-2"
                          >
                            <Eye className="h-4 w-4" />{" "}
                            <span>View Details</span>
                          </DropdownMenuItem>
                          {dep.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-secondary cursor-pointer gap-2"
                                onClick={() => handleUpdate(dep._id, "approve")}
                              >
                                <CheckCircle className="h-4 w-4" />{" "}
                                <span>Approve</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer gap-2"
                                onClick={() => handleUpdate(dep._id, "reject")}
                              >
                                <XCircle className="h-4 w-4" />{" "}
                                <span>Reject</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * 5 + 1} to {Math.min(page * 5, total)} of{" "}
            {total} deposits
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isPending}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 5 >= total || isPending}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {selected && (
        <DepositDetailsModal
          open={!!selected}
          deposit={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleUpdate(selected._id, "approve")}
          onReject={() => handleUpdate(selected._id, "reject")}
        />
      )}
    </>
  );
}