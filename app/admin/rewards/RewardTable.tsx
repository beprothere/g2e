"use client";

import React, { useEffect, useState } from "react";
import { Edit2, Check, X, SearchX } from "lucide-react";
import toast from "react-hot-toast";
import { updateRewardClaimStatus } from "@/app/actions/rewardActions";

export default function RewardTable({
  initialClaims,
  initialTotalClaims,
}: {
  initialClaims: any[];
  initialTotalClaims: number;
}) {
  const [claims, setClaims] = useState(initialClaims);
  const [totalClaims, setTotalClaims] = useState(initialTotalClaims);
  const [isPageLoading, setIsPageLoading] = useState(initialClaims.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ status: "", tracking: "" });
  const totalPages = Math.ceil(totalClaims / itemsPerPage);

  useEffect(() => {
    if (currentPage === 1 && initialClaims.length > 0) {
      setClaims(initialClaims);
      setTotalClaims(initialTotalClaims);
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();

    const loadPage = async () => {
      setIsPageLoading(true);
      try {
        const res = await fetch(
          `/api/admin/reward-claims?page=${currentPage}&limit=${itemsPerPage}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (!isCancelled) {
          setClaims(data.items || []);
          if (typeof data.total === "number") {
            setTotalClaims(data.total);
          }
        }
      } catch (err: any) {
        if (!isCancelled && err?.name !== "AbortError") {
          toast.error("Failed to load claims");
        }
      } finally {
        if (!isCancelled) {
          setIsPageLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [currentPage, initialClaims, initialTotalClaims]);

  const handleSave = async (id: string) => {
    const tId = toast.loading("Updating...");
    try {
      const response = await updateRewardClaimStatus(
        id,
        editData.status,
        editData.tracking,
      );
      if (response?.success) {
        setClaims((prev) =>
          prev.map((c) =>
            c._id === id
              ? {
                  ...c,
                  status: editData.status,
                  trackingNumber: editData.tracking,
                }
              : c,
          ),
        );
        setEditingId(null);
        toast.success("Updated!", { id: tId });
      } else {
        toast.error("Update failed", { id: tId });
      }
    } catch (err) {
      toast.error("Error updating", { id: tId });
    }
  };

  return (
    <div className="max-w-350 mx-auto px-6 pb-10 space-y-6">
      <div className="bg-white border rounded-xl shadow-sm flex flex-col min-h-125 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Reward Claims</h2>
            <p className="text-xs text-gray-400 font-medium">
              Manage and track user reward shipments
            </p>
          </div>
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full uppercase tracking-widest border border-indigo-100">
            Records: {totalClaims}
          </span>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isPageLoading ? (
            <div className="p-8 space-y-4">
              <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          ) : claims.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 text-gray-500 text-[11px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5 text-left"># Index</th>
                  <th className="px-8 py-5 text-left">Reward Detail</th>
                  <th className="px-8 py-5 text-left">Customer</th>
                  <th className="px-8 py-5 text-left">Status</th>
                  <th className="px-8 py-5 text-left">Tracking Number</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-8 py-6 text-gray-400 font-bold text-sm">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900 text-sm">
                        {item.rewardName}
                      </p>
                      <span className="text-[10px] text-gray-400 font-black uppercase">
                        Level {item.level}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-800 text-sm">
                        {item.userName}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {item.userEmail}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      {editingId === item._id ? (
                        <select
                          value={editData.status}
                          onChange={(e) =>
                            setEditData({ ...editData, status: e.target.value })
                          }
                          className="border rounded-xl p-1.5 text-xs font-bold outline-none ring-2 ring-orange-500/20"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Received">Received</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${
                            item.status === "Received"
                              ? "bg-green-100 text-green-600"
                              : item.status === "Processing"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {editingId === item._id ? (
                        <input
                          value={editData.tracking}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              tracking: e.target.value,
                            })
                          }
                          className="border rounded-xl px-3 py-2 text-xs font-bold ring-2 ring-orange-500/20 w-full font-mono"
                        />
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-400">
                          {item.trackingNumber || "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center items-center gap-4">
                        {editingId === item._id ? (
                          <>
                            <button
                              onClick={() => handleSave(item._id)}
                              className="text-green-500 hover:scale-125 transition-all"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-red-400 hover:scale-125 transition-all"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item._id);
                              setEditData({
                                status: item.status,
                                tracking: item.trackingNumber || "",
                              });
                            }}
                            className="text-gray-300 hover:text-gray-900 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
                <SearchX size={48} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                No records found
              </h3>
              <p className="text-gray-400 text-sm max-w-sm mt-2 font-medium">
                No reward claims are available yet.
              </p>
            </div>
          )}
        </div>

        <div className="p-8 border-t flex justify-between items-center bg-gray-50/30">
          <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((c) => c - 1)}
              className="px-6 py-2.5 border border-gray-200 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 shadow-sm transition-all"
            >
              PREVIOUS
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((c) => c + 1)}
              className="px-6 py-2.5 border border-gray-200 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 shadow-sm transition-all"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
