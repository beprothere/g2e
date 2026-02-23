"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  SearchX,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { InvestmentDetailsModal } from "./investment-details-modal";
import { updateInvestmentStatus } from "@/app/actions/investment-actions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InvestmentRequestsClient({
  initialData,
  pagination: initialPagination,
}: any) {
  const [selected, setSelected] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const { data, mutate } = useSWR(
    `/api/admin/investment-requests?page=${page}`,
    fetcher,
    {
      fallbackData: {
        success: true,
        data: initialData,
        pagination: initialPagination,
      },
      refreshInterval: 1000,
      revalidateOnFocus: true,
    },
  );

  const requests = data?.data || [];
  const pagination = data?.pagination || initialPagination;

  const shortId = (id: string) => id.slice(-6).toUpperCase();

  const handleStatusUpdate = async (
    id: string,
    action: "approve" | "reject",
  ) => {
    const res = await updateInvestmentStatus(id, action);
    if (res.success) {
      toast.success(action === "approve" ? "Approved!" : "Rejected!");
      mutate();
    } else {
      toast.error(res.message || "Failed");
    }
  };

  const changePage = (newPage: number) => {
    router.push(`?page=${newPage}`, { scroll: false });
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      Pending: "bg-accent/20 text-accent",
      "In Progress": "bg-primary/20 text-primary",
      Rejected: "bg-destructive/20 text-destructive",
      Approved: "bg-secondary/20 text-secondary",
    };
    return (
      <Badge
        className={`${styles[status] || "bg-muted text-muted-foreground"} border-0`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Investment Requests</h2>
            <p className="text-sm text-muted-foreground">
              Approve or reject investment plan requests
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-225">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Refs</th>
                <th className="px-6 py-4 text-center">Commission</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <SearchX
                        size={48}
                        className="text-muted-foreground/20 mb-4"
                      />
                      <h3 className="text-lg font-bold">No Records Found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((row: any) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td
                      className="px-6 py-4 font-mono text-xs cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(row.id);
                        toast.success("ID Copied");
                      }}
                    >
                      INV-{shortId(row.id)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{row.userName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        USR-{shortId(row.userId)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-primary/10 text-primary border-0">
                        {row.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${row.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.refsRequired}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="text-secondary border-secondary/20"
                      >
                        {row.roiPercentage}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {row.status === "Pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-secondary gap-2"
                                onClick={() =>
                                  handleStatusUpdate(row.id, "approve")
                                }
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive gap-2"
                                onClick={() =>
                                  handleStatusUpdate(row.id, "reject")
                                }
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => setSelected(row)}>
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
          <span className="text-xs text-muted-foreground">
            Showing {(page - 1) * 10 + 1}–
            {Math.min(page * 10, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => changePage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {selected && (
        <InvestmentDetailsModal
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
