"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EditUserModal } from "./edit-user-modal";
import toast from "react-hot-toast";

const LIMIT = 10;

export function UsersTable({ users, total, page, totalPages }: any) {
  const [editUser, setEditUser] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

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

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin-panel/platform-users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    toast.success(`User ${action} success`);
    router.refresh();
  };

  return (
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
            {users.length === 0 ? (
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
                      We couldn't find any results matching your search or
                      filters. Please try again with different keywords or reset
                      your selection.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u._id} className="border-b">
                  <td className="px-6 py-4 font-mono text-xs uppercase">
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
                  <td className="px-6 py-4 text-right">${u.depositBalance}</td>
                  <td className="px-6 py-4 text-right">${u.withdrawBalance}</td>
                  <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                  <td className="px-6 py-4">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
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
                          onClick={() => handleAction(u._id, "freezeReferral")}
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

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => router.refresh()}
        />
      )}
    </Card>
  );
}
