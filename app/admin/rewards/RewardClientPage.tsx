"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import {
  Smartphone,
  Monitor,
  Bike,
  Car,
  Gift,
  Save,
  Trash2,
  Edit3,
  X,
  Plus,
  Palette,
  Laptop,
  Watch,
  Trophy,
  CheckCircle2,
  PackageCheck,
  Hourglass,
  XCircle,
} from "lucide-react";
import {
  createReward,
  updateReward,
  deleteReward,
} from "@/app/actions/rewardActions";
import toast, { Toaster } from "react-hot-toast";
import ReawardsDeleteModal from "@/app/components/admin/ReawardsDeleteModal";

const RewardTable = dynamic(() => import("./RewardTable"), {
  ssr: false,
  loading: () => (
    <div className="max-w-350 mx-auto px-6 pb-10">
      <div className="h-40 rounded-xl border bg-card animate-pulse" />
    </div>
  ),
});

const iconOptions: Record<string, any> = {
  Smartphone,
  Monitor,
  Bike,
  Car,
  Gift,
  Laptop,
  Watch,
  Trophy,
};

const colorOptions = [
  {
    name: "Blue",
    color: "from-blue-500 to-blue-600",
    accent: "bg-blue-100 text-blue-700",
  },
  {
    name: "Purple",
    color: "from-purple-500 to-purple-600",
    accent: "bg-purple-100 text-purple-700",
  },
  {
    name: "Orange",
    color: "from-orange-500 to-orange-600",
    accent: "bg-orange-100 text-orange-700",
  },
  {
    name: "Emerald",
    color: "from-emerald-500 to-emerald-600",
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Red",
    color: "from-red-500 to-red-600",
    accent: "bg-red-100 text-red-700",
  },
];

type RewardStats = {
  total: number;
  delivered: number;
  pending: number;
  rejected: number;
};

export default function RewardClientPage({
  initialRewards,
  stats,
  plainClaims,
  initialClaimsTotal,
  loadOverviewOnClient = false,
}: {
  initialRewards: any[];
  stats: RewardStats;
  plainClaims: any[];
  initialClaimsTotal: number;
  loadOverviewOnClient?: boolean;
}) {
  const defaultStats: RewardStats = {
    total: 0,
    delivered: 0,
    pending: 0,
    rejected: 0,
  };

  const [rewards, setRewards] = useState(initialRewards);
  const [statsState, setStatsState] = useState<RewardStats>(stats || defaultStats);
  const [isOverviewLoading, setIsOverviewLoading] = useState(loadOverviewOnClient);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any | null>(null);

  const [rewardName, setRewardName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Gift");
  const [selectedTheme, setSelectedTheme] = useState(colorOptions[0]);

  const availableLevels = useMemo(() => {
    const usedLevels = rewards.map((r) => Number(r.level));
    return [1, 2, 3, 4, 5, 6, 7].filter((l) => !usedLevels.includes(l));
  }, [rewards]);

  const sortedRewards = useMemo(
    () => [...rewards].sort((a, b) => a.level - b.level),
    [rewards],
  );

  useEffect(() => {
    if (!loadOverviewOnClient) return;

    let isCancelled = false;
    const controller = new AbortController();

    const fetchOverview = async () => {
      setIsOverviewLoading(true);
      try {
        const res = await fetch("/api/admin/rewards/overview", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch overview: ${res.status}`);
        }

        const data = await res.json();

        if (!isCancelled) {
          setRewards(Array.isArray(data?.rewards) ? data.rewards : []);
          setStatsState({ ...defaultStats, ...(data?.stats || {}) });
        }
      } catch (err: any) {
        if (!isCancelled && err?.name !== "AbortError") {
          console.error("Failed to load rewards overview:", err);
        }
      } finally {
        if (!isCancelled) {
          setIsOverviewLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [loadOverviewOnClient]);

  useEffect(() => {
    const name = rewardName.toLowerCase();
    if (name.includes("phone") || name.includes("mobile"))
      setSelectedIcon("Smartphone");
    else if (
      name.includes("led") ||
      name.includes("tv") ||
      name.includes("monitor")
    )
      setSelectedIcon("Monitor");
    else if (name.includes("bike")) setSelectedIcon("Bike");
    else if (name.includes("car")) setSelectedIcon("Car");
    else if (name.includes("laptop")) setSelectedIcon("Laptop");
    else if (name.includes("watch")) setSelectedIcon("Watch");
  }, [rewardName]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const finalPayload = {
      ...data,
      level: Number(data.level),
      recruits: Number(data.recruits),
      icon: selectedIcon,
      color: selectedTheme.color,
      accentColor: selectedTheme.accent,
    };

    const loadingToast = toast.loading("Creating reward...");
    try {
      await createReward(finalPayload);
      toast.success("Reward created successfully!", { id: loadingToast });
      setIsFormOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Validation failed or DB error.", { id: loadingToast });
    }
  };

  const handleInlineUpdate = async (id: string) => {
    const loadingToast = toast.loading("Updating card...");
    try {
      await updateReward(id, editFormData);
      toast.success("Card updated!", { id: loadingToast });
      setInlineEditingId(null);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error("Update failed", { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!selectedReward?._id) return;
    const loadingId = toast.loading("Deleting reward...");
    try {
      await deleteReward(selectedReward._id);
      toast.success("Deleted successfully", { id: loadingId });
      setShowDeleteModal(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error("Delete failed", { id: loadingId });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Toaster position="top-right" />

      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-card p-6 flex flex-col gap-2 justify-between w-full items-start group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-xl">
            <div className="flex items-start justify-between gap-6 w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-muted-foreground font-medium">
                  Total Claimed
                </p>
                {isOverviewLoading ? (
                  <div className="h-9 w-16 mt-2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : (
                  <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                    {statsState.total}
                  </p>
                )}
              </div>
              <div
                className={`h-14 w-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 duration-500`}
              >
                <Gift size={28} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Total rewards claimed across all users
            </p>
          </Card>

          <Card className="relative overflow-hidden bg-card p-6 flex flex-col gap-2 w-full items-start group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-xl">
            <div className="flex items-start justify-between gap-6 w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-muted-foreground font-medium">
                  Total Delivered
                </p>
                {isOverviewLoading ? (
                  <div className="h-9 w-16 mt-2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : (
                  <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                    {statsState.delivered}
                  </p>
                )}
              </div>
              <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 duration-500">
                <PackageCheck size={28} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total rewards delivered across all users
            </p>
          </Card>

          <Card className="relative overflow-hidden bg-card p-6 flex flex-col gap-2 w-full items-start group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-xl">
            <div className="flex items-start justify-between gap-6 w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-muted-foreground font-medium">
                  Total Pending
                </p>
                {isOverviewLoading ? (
                  <div className="h-9 w-16 mt-2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : (
                  <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                    {statsState.pending}
                  </p>
                )}
              </div>
              <div className="h-14 w-14 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110 duration-500">
                <Hourglass size={28} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total rewards pending across all users</p>
          </Card>

          <Card className="relative overflow-hidden bg-card p-6 flex flex-col gap-2 w-full items-start group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-xl">
            <div className="flex items-start justify-between gap-6 w-full">
              <div className="flex flex-col items-start">
                <p className="text-sm text-muted-foreground font-medium">
                  Total Rejected
                </p>
                {isOverviewLoading ? (
                  <div className="h-9 w-16 mt-2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : (
                  <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                    {statsState.rejected}
                  </p>
                )}
              </div>
              <div className="h-14 w-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 transition-transform group-hover:scale-110 duration-500">
                <XCircle size={28} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total rewards rejected across all users</p>
          </Card>
        </div>
      </section>

      <RewardTable
        initialClaims={plainClaims}
        initialTotalClaims={initialClaimsTotal}
      />

      {showDeleteModal && (
        <ReawardsDeleteModal
          rewardName={selectedReward?.name}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedReward(null);
          }}
          onDelete={confirmDelete}
        />
      )}

      <button
        onClick={() => {
          setIsFormOpen(!isFormOpen);
        }}
        className={`flex items-center gap-2 mx-auto px-8 py-4 mb-16 rounded-full font-bold transition-all shadow-xl hover:scale-105 active:scale-95 ${isFormOpen ? "bg-secondary text-foreground" : "bg-primary text-white"}`}
      >
        {isFormOpen ? <X size={20} /> : <Plus size={20} />}
        {isFormOpen ? "Cancel Action" : "Create New Reward"}
      </button>

      {isFormOpen && (
        <section className="max-w-4xl mx-auto px-4 mb-20 animate-in slide-in-from-top-10 duration-500">
          <Card className="p-8 border-2 border-primary/20 glass shadow-2xl relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${selectedTheme.color}`}
            />
            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 uppercase tracking-wider">
                  Reward Name
                </label>
                <input
                  name="name"
                  required
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-background border-2 border-primary/5 focus:border-primary outline-none transition-all"
                  placeholder="Smartphone Master"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 uppercase tracking-wider">
                  Select Level
                </label>
                <select
                  name="level"
                  className="w-full p-4 rounded-2xl bg-background border-2 border-primary/5 outline-none focus:border-primary"
                >
                  {availableLevels.map((l) => (
                    <option key={l} value={l}>
                      Level {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 uppercase tracking-wider">
                  Recruits Required
                </label>
                <input
                  name="recruits"
                  type="number"
                  required
                  className="w-full p-4 rounded-2xl bg-background border-2 border-primary/5 outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 uppercase tracking-wider">
                  Reward Title
                </label>
                <input
                  name="reward"
                  required
                  className="w-full p-4 rounded-2xl bg-background border-2 border-primary/5 outline-none focus:border-primary"
                  placeholder="iPhone 15 Pro"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold opacity-70 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  className="w-full p-4 rounded-2xl bg-background border-2 border-primary/5 outline-none focus:border-primary h-28"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-secondary/30 border border-primary/10">
                <div className="space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Palette size={18} /> Pick Card Color
                  </label>
                  <div className="flex gap-4">
                    {colorOptions.map((opt) => (
                      <div
                        key={opt.name}
                        onClick={() => setSelectedTheme(opt)}
                        className={`h-12 w-12 rounded-full cursor-pointer transition-all border-4 ${selectedTheme.name === opt.name ? "border-primary scale-110 shadow-lg" : "border-white/20 hover:border-white/50"} bg-linear-to-br ${opt.color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold">
                    Manual Icon Correction
                  </label>
                  <select
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border-2 border-primary/5 outline-none focus:border-primary"
                  >
                    {Object.keys(iconOptions).map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="md:col-span-2 bg-primary text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20"
              >
                <Save size={24} /> Create Reward Tier
              </button>
            </form>
          </Card>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Active Reward Tiers</h2>
          <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
        </div>

        {isOverviewLoading &&
          [1, 2].map((idx) => (
            <Card
              key={`reward-skeleton-${idx}`}
              className="glass border-primary/20 p-8 md:p-12 shadow-lg"
            >
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-4xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                <div className="grow w-full space-y-3">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-10 w-64 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-4 w-80 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              </div>
            </Card>
          ))}

        {!isOverviewLoading &&
          sortedRewards.map((tier) => {
            const isInlineEditing = inlineEditingId === tier._id;
            const Icon = iconOptions[tier.icon] || Gift;

            return (
              <div key={tier._id} className="group relative">
                {/* Action Buttons */}
                <div className="absolute -top-4 -right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  {!isInlineEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setInlineEditingId(tier._id);
                          setEditFormData({ ...tier });
                        }}
                        className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReward(tier);
                          setShowDeleteModal(true);
                        }}
                        className="p-4 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-red-700 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInlineUpdate(tier._id)}
                        className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl hover:bg-emerald-700 transition-all"
                      >
                        <Save size={20} />
                      </button>
                      <button
                        onClick={() => setInlineEditingId(null)}
                        className="p-4 bg-gray-600 text-white rounded-2xl shadow-xl hover:bg-gray-700 transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>

                <Card
                  className={`glass border-primary/20 p-8 md:p-12 transition-all duration-500 shadow-lg hover:shadow-2xl relative overflow-hidden ${isInlineEditing ? "ring-2 ring-emerald-500 shadow-emerald-500/10" : "hover:scale-[1.01]"}`}
                >
                  <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-4xl bg-linear-to-br ${tier.color} flex items-center justify-center text-white shadow-2xl shrink-0 transition-transform duration-500 group-hover:rotate-6`}
                    >
                      <Icon size={48} />
                    </div>

                    {/* TEXT CONTENT - NO PADDING INPUTS */}
                    <div className="grow text-center md:text-left space-y-3 w-full overflow-hidden">
                      <span
                        className={`inline-block text-[10px] font-black tracking-[0.2em] uppercase ${tier.accentColor} px-4 py-1.5 rounded-full shadow-sm border border-black/5`}
                      >
                        LEVEL {tier.level}
                      </span>

                      {isInlineEditing ? (
                        <div className="flex flex-col gap-1 w-full">
                          <input
                            className="text-3xl md:text-4xl font-black text-foreground bg-transparent border-none outline-none p-0 focus:ring-0 w-full"
                            value={editFormData.name}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                name: e.target.value,
                              })
                            }
                          />
                          <textarea
                            className="text-foreground/60 text-lg font-medium bg-transparent border-none outline-none p-0 focus:ring-0 w-full resize-none leading-tight"
                            value={editFormData.description}
                            rows={2}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-3xl md:text-4xl font-black text-foreground">
                            {tier.name}
                          </h3>
                          <p className="text-foreground/60 text-lg max-w-2xl font-medium">
                            {tier.description}
                          </p>
                        </>
                      )}
                    </div>

                    {/* STATS AREA - ALIGNED INPUTS */}
                    <div className="flex flex-col gap-1 md:text-right shrink-0 border-t md:border-t-0 md:border-l border-primary/10 pt-6 md:pt-0 md:pl-10 min-w-45 w-full md:w-auto">
                      {isInlineEditing ? (
                        <div className="space-y-1">
                          <input
                            type="number"
                            className="text-4xl font-black text-primary bg-transparent border-none outline-none p-0 focus:ring-0 w-full md:text-right"
                            value={editFormData.recruits}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                recruits: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-4">
                            Required Recruits
                          </p>
                          <div className="flex items-center gap-2 md:justify-end">
                            <CheckCircle2 size={18} className="text-accent" />
                            <input
                              className="text-xl font-black text-accent bg-transparent border-none outline-none p-0 focus:ring-0 w-full md:text-right italic uppercase"
                              value={editFormData.reward}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  reward: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-4xl font-black text-primary tabular-nums">
                            {tier.recruits.toLocaleString()}
                          </p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-4">
                            Required Recruits
                          </p>
                          <div className="flex items-center gap-2 md:justify-end text-accent font-black text-xl italic uppercase">
                            <CheckCircle2 size={18} /> {tier.reward}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className={`absolute -right-20 -bottom-20 w-64 h-64 bg-linear-to-br ${tier.color} opacity-5 blur-[80px] rounded-full`}
                  />
                </Card>
              </div>
            );
          })}

        {!isOverviewLoading && sortedRewards.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No reward tiers found.
          </Card>
        )}
      </section>
    </div>
  );
}
