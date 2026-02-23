"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import useSWR from "swr";
import { toast } from "react-hot-toast"; 

const fetcher = (url: string) =>
  fetch(`${url}?t=${Date.now()}`, { cache: "no-store" }).then((res) =>
    res.json(),
  );

const TeamClientUI = ({ referralLink }: { referralLink: string }) => {
  const [levelFilter, setLevelFilter] = useState<"all" | "1" | "2">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "verified" | "pending"
  >("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: swrResponse,
    error,
    isLoading,
  } = useSWR("/api/referral/overview", fetcher, {
    refreshInterval: 2000,
  });

  const initialMembers = useMemo(() => {
    if (!swrResponse?.success || !swrResponse?.referralTree) return [];
    const flat: any[] = [];
    swrResponse.referralTree.forEach((u1: any) => {
      flat.push({
        name: u1.name,
        email: u1.email,
        date: u1.date,
        status: u1.status,
        earnings: Number(u1.earnings || 0).toFixed(2),
        level: 1,
      });
      (u1.children || []).forEach((u2: any) => {
        flat.push({
          name: u2.name,
          email: u2.email,
          date: u2.date,
          status: u2.status,
          earnings: Number(u2.earnings || 0).toFixed(2),
          level: 2,
        });
      });
    });
    return flat;
  }, [swrResponse]);

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((m) => {
      const matchLevel =
        levelFilter === "all" || m.level.toString() === levelFilter;
      const matchStatus =
        statusFilter === "all" || m.status.toLowerCase() === statusFilter;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchLevel && matchStatus && matchSearch;
    });
  }, [initialMembers, levelFilter, statusFilter, search]);

  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, currentPage, rowsPerPage]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex flex-col justify-between sm:flex-row gap-4">
        <div className="relative w-full sm:w-85">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="w-full pl-9 pr-4 py-2 rounded-md border bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="h-10 px-3 rounded-md border bg-white text-sm outline-none"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 rounded-md border bg-white text-sm outline-none"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr className="text-left text-muted-foreground font-medium">
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4 text-center">Level</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                // --- SKELETON LOADING START ---
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-4 bg-muted rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted/60 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-muted rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-muted rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-muted rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedMembers.length > 0 ? (
                paginatedMembers.map((m, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground italic">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {m.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.level === 1 ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                      >
                        {m.level === 1 ? "Direct" : "In Direct"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.status.toLowerCase() === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {m.date}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      ${m.earnings}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                      <div className="bg-primary/5 p-6 rounded-full mb-4 ring-1 ring-primary/20">
                        <Users className="h-10 w-10 text-primary opacity-60" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        No Team Members Yet
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-84 mt-2 mb-8 leading-relaxed">
                        {search ||
                        levelFilter !== "all" ||
                        statusFilter !== "all"
                          ? "We couldn't find any members matching your current filters. Try resetting them."
                          : "Start building your network! Share your link to earn high commissions from Direct and Indirect referrals based on your current plan."}
                      </p>

                      {!(
                        search ||
                        levelFilter !== "all" ||
                        statusFilter !== "all"
                      ) && (
                        <div className="w-full max-w-md">
                          <div className="flex items-center gap-2 p-1.5 bg-muted/40 border border-dashed border-primary/30 rounded-xl">
                            <div className="flex-1 px-3 text-left overflow-hidden">
                              <p className="text-[10px] text-primary font-bold uppercase tracking-tighter opacity-70">
                                Share & Earn Commission
                              </p>
                              <p className="text-xs truncate font-mono text-muted-foreground">
                                {referralLink}
                              </p>
                            </div>
                            <button
                              onClick={copyToClipboard}
                              className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 text-xs font-bold"
                            >
                              <Copy size={14} />
                              Copy Link
                            </button>
                          </div>
                          <p className="mt-4 text-[11px] text-muted-foreground italic">
                            Tip: Upgrade your plan to increase your direct
                            referral commission up to 60%!
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md disabled:opacity-30 bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border rounded-md disabled:opacity-30 bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeamClientUI;
