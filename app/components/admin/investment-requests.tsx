"use client";

import { useEffect, useState } from "react";
import { MoreVertical, CheckCircle, XCircle, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { InvestmentDetailsModal } from "./investment-details-modal";

export function InvestmentRequests() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const fetchData = async () => {
    const res = await fetch(`/api/admin/investment-requests?page=${page}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      setPagination(json.pagination);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }, 30000);
    return () => clearInterval(i);
  }, [page]);

  const shortId = (id: string) => id.slice(-6).toUpperCase();

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  const updateStatus = async (id: string, action: "approve" | "reject") => {
    const res = await fetch("/api/admin/investment-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id, action }),
    });

    const json = await res.json();

    if (json.success) {
      toast.success(
        action === "approve"
          ? "Plan approved successfully"
          : "Plan rejected successfully",
      );
      fetchData();
    } else {
      toast.error(json.message || "Action failed");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Pending")
      return (
        <Badge className="bg-accent/20 text-accent border-0">Pending</Badge>
      );
    if (status === "In Progress")
      return (
        <Badge className="bg-primary/20 text-primary border-0">
          In Progress
        </Badge>
      );
    if (status === "Rejected")
      return (
        <Badge className="bg-destructive/20 text-destructive border-0">
          Rejected
        </Badge>
      );
    return (
      <Badge className="bg-secondary/20 text-secondary border-0">
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Investment Requests</h2>
          <p className="text-sm text-muted-foreground">
            Approve or reject investment plan requests
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-225">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Refs Required</th>
                <th className="px-6 py-4">ROI</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center">
                    No data found
                  </td>
                </tr>
              )}

              {data.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  <td
                    className="px-6 py-4 font-mono text-xs cursor-pointer"
                    onClick={() => copyId(row.id)}
                  >
                    INV-{shortId(row.id)}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium">{row.userName}</p>
                    <p
                      className="text-xs text-muted-foreground cursor-pointer"
                      onClick={() => copyId(row.userId)}
                    >
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

                  <td className="px-6 py-4 text-muted-foreground">
                    {row.refsRequired}
                  </td>

                  <td className="px-6 py-4">
                    <Badge className="bg-secondary/20 text-secondary border-0">
                      {row.roiPercentage}%
                    </Badge>
                  </td>

                  <td className="px-6 py-4">{getStatusBadge(row.status)}</td>

                  <td className="px-6 py-4 text-muted-foreground">
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
                              onClick={() => updateStatus(row.id, "approve")}
                            >
                              <CheckCircle className="h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive gap-2"
                              onClick={() => updateStatus(row.id, "reject")}
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * 10 + 1}–
            {Math.min(page * 10, pagination?.total || 0)} of {pagination?.total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === pagination?.totalPages}
              onClick={() => setPage(page + 1)}
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
