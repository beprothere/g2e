"use client";

import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  SearchX,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { exportData } from "@/lib/export-utils";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditUserModal } from "./edit-user-modal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const LIMIT = 10;

const chipStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Verified: "bg-green-100 text-green-700",
  Blocked: "bg-red-100 text-red-700",
  Free: "bg-gray-100 text-gray-700",
  Basic: "bg-blue-100 text-blue-700",
  Standard: "bg-indigo-100 text-indigo-700",
  Premium: "bg-purple-100 text-purple-700",
  "7d": "bg-orange-100 text-orange-700",
  "30d": "bg-cyan-100 text-cyan-700",
  "90d": "bg-teal-100 text-teal-700",
};

export function UsersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();
  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    `/api/admin-panel/platform-users?${queryString}`,
    fetcher,
    { refreshInterval: 5000 }, 
  );

  const users = response?.users || [];
  const total = response?.total || 0;
  const page = Number(searchParams.get("page")) || 1;
  const totalPages = response?.totalPages || 1;

  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "all",
    plan: searchParams.get("plan") || "all",
    dateRange: searchParams.get("dateRange") || "all",
  });

  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => {
    setLocalFilters({
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "all",
      plan: searchParams.get("plan") || "all",
      dateRange: searchParams.get("dateRange") || "all",
    });
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.search) params.set("search", localFilters.search);
    if (localFilters.status !== "all")
      params.set("status", localFilters.status);
    if (localFilters.plan !== "all") params.set("plan", localFilters.plan);
    if (localFilters.dateRange !== "all")
      params.set("dateRange", localFilters.dateRange);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const resetAll = () => router.push("?");

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin-panel/platform-users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    toast.success(`User ${action} success`);
    mutate();
  };

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  const getPlanBadge = (plan: string) => {
    const map: any = {
      Free: "bg-muted/20 text-muted-foreground",
      Basic: "bg-accent/20 text-accent",
      Standard: "bg-secondary/20 text-secondary",
      Premium: "bg-primary/20 text-primary",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${map[plan]}`}>
        {plan}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      Pending: "bg-accent/20 text-accent",
      Verified: "bg-green-100 text-green-600",
      Active: "bg-green-100 text-green-600",
      Blocked: "bg-red-100 text-red-600",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${map[status]}`}>
        {status}
      </span>
    );
  };

  const activeFilters = [
    { key: "search", value: searchParams.get("search") },
    { key: "status", value: searchParams.get("status") },
    { key: "plan", value: searchParams.get("plan") },
    { key: "dateRange", value: searchParams.get("dateRange") },
  ].filter((f) => f.value && f.value !== "all");

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex items-end justify-between gap-4 lg:gap-12 lg:flex-row flex-col md:flex-row filter-inner-box-user">
          <div className="flex items-start md:items-center lg:items-center gap-4 justify-start w-full flex-col lg:flex-row md:flex-row">
            <div className="w-full lg:w-fit">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative w-full lg:w-fit">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 w-full md:w-64"
                  placeholder="Name, email, ID..."
                  value={localFilters.search}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, search: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex w-full lg:w-fit items-start gap-4 flex-col lg:flex-row md:flex-row user-filters-date-satus-box">
              <div className="w-full lg:w-30">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={localFilters.status}
                  onValueChange={(v) =>
                    setLocalFilters({ ...localFilters, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-30">
                <label className="text-sm font-medium mb-2 block">Plan</label>
                <Select
                  value={localFilters.plan}
                  onValueChange={(v) =>
                    setLocalFilters({ ...localFilters, plan: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-30">
                <label className="text-sm font-medium mb-2 block">
                  Date Range
                </label>
                <Select
                  value={localFilters.dateRange}
                  onValueChange={(v) =>
                    setLocalFilters({ ...localFilters, dateRange: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4 flex-row export-filter-btn-box">
            <Button
              variant="outline"
              size="sm"
              onClick={applyFilters}
              className="gap-2"
            >
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => void exportData(users, "xlsx", "Users_Report")}
                >
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void exportData(users, "pdf", "Users_Report")}
                >
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void exportData(users, "docx", "Users_Report")}
                >
                  Word
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void exportData(users, "txt", "Users_Report")}
                >
                  Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center justify-between mt-5 border-t pt-5 flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <div
                  key={f.key}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${chipStyles[f.value!] || "bg-muted text-muted-foreground"}`}
                >
                  <span className="capitalize">
                    {f.key}: {f.value}
                  </span>
                  <button
                    onClick={() => removeFilter(f.key)}
                    className="font-bold hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={resetAll}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            User Management Table
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor user accounts, manage access, and review user's activity.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left">User ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Contact</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-right">Wallet</th>
                <th className="px-6 py-4 text-right">Referral</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-left">IP</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <td key={i} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                      <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
                        <SearchX size={48} className="text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        No records found
                      </h3>
                      <p className="text-gray-400 text-sm max-w-sm mt-2 font-medium">
                        Try different keywords or reset selection.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr
                    key={u._id}
                    className="border-b hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs uppercase underline decoration-primary/20 cursor-help">
                      USR-{u._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 font-medium">{u.fullName}</td>
                    <td className="px-6 py-4">
                      <div>{u.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getPlanBadge(u.plan)}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${u.depositBalance}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${u.withdrawBalance}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs opacity-60">
                      {u.ipAddress || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/users/${u._id}`)}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditUser(u)}>
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-yellow-600"
                            onClick={() =>
                              handleAction(u._id, "freezeReferral")
                            }
                          >
                            Freeze Referrals
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleAction(u._id, "block")}
                          >
                            Block User
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {from} to {to} of {total.toLocaleString()} results
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => updatePage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => updatePage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => mutate()}
        />
      )}
    </div>
  );
}
