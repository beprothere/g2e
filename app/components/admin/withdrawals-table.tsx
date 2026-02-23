"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Pause,
  SearchX,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WithdrawalDetailsModal } from "./WithdrawalDetailsModal";
import { updateWithdrawalStatus } from "@/app/admin/withdrawals/actions";
import toast from "react-hot-toast";

export function WithdrawalsTable({
  initialData,
  total,
  page,
  onPageChange,
}: any) {
  const [selected, setSelected] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = (id: string, action: "approve" | "reject" | "hold") => {
    startTransition(async () => {
      const res = await updateWithdrawalStatus(id, action);
      if (res.success) {
        toast.success(
          `Withdrawal ${action === "hold" ? "put on hold" : action + "ed"}`,
        );
        setSelected(null);
        router.refresh();
      } else {
        toast.error("Update failed");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const styles: any = {
      pending: "bg-accent/20 text-accent",
      approved: "bg-primary/20 text-primary",
      processing: "bg-primary/20 text-primary",
      completed: "bg-secondary/20 text-secondary",
      rejected: "bg-destructive/20 text-destructive",
    };
    return (
      <Badge className={`${styles[s] || ""} border-0 capitalize`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card
      className={`rounded-2xl overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Withdrawal Requests
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Process and approve withdrawal requests
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
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
                      <SearchX size={48} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                      No records found
                    </h3>
                    <p className="text-gray-400 text-sm max-w-sm mt-2 font-medium">
                      No Withdrawal requests found. There are currently no
                      pending or completed withdrawals to display. Please check
                      back later.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              initialData.map((wtd: any) => {
                const currentStatus = wtd.status.toLowerCase();
                return (
                  <tr
                    key={wtd._id}
                    className="border-b border-border hover:bg-muted/30 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {wtd.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{wtd.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {wtd.accountName} ({wtd.accountDetails})
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-destructive">
                      -${wtd.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="border-0 bg-primary/10 text-primary"
                      >
                        {wtd.method}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(wtd.status)}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {wtd.date}
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
                            onClick={() => setSelected(wtd)}
                            className="cursor-pointer"
                          >
                            View Details
                          </DropdownMenuItem>

                          {currentStatus === "pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-secondary cursor-pointer gap-2"
                                onClick={() => handleUpdate(wtd._id, "approve")}
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer gap-2"
                                onClick={() => handleUpdate(wtd._id, "reject")}
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}

                          {currentStatus === "rejected" && (
                            <>
                              <DropdownMenuItem
                                className="text-secondary cursor-pointer gap-2"
                                onClick={() => handleUpdate(wtd._id, "approve")}
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-accent cursor-pointer gap-2"
                                onClick={() => handleUpdate(wtd._id, "hold")}
                              >
                                <Pause className="h-4 w-4" /> Hold
                              </DropdownMenuItem>
                            </>
                          )}

                          {currentStatus === "completed" && (
                            <>
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer gap-2"
                                onClick={() => handleUpdate(wtd._id, "reject")}
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-accent cursor-pointer gap-2"
                                onClick={() => handleUpdate(wtd._id, "hold")}
                              >
                                <Pause className="h-4 w-4" /> Hold
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * 5 + 1} to {Math.min(page * 5, total)} of {total}{" "}
          withdrawals
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

      {selected && (
        <WithdrawalDetailsModal
          open={!!selected}
          withdrawal={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleUpdate(selected._id, "approve")}
          onReject={() => handleUpdate(selected._id, "reject")}
        />
      )}
    </Card>
  );
}

