"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import useSWR from "swr";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { EditUserModal } from "@/app/components/admin/edit-user-modal";
import {
  Pencil,
  Check,
  X,
  ShieldCheck,
  Ban,
  Clock,
  SearchX,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  updateTrxStatus,
  updateSerumOrderAction,
} from "@/app/actions/adminActions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserProfileClient({
  initialUser,
  userId,
  initialOrders,
  initialTransactions,
}: {
  initialUser: any;
  userId: string;
  initialOrders: any[];
  initialTransactions: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: user, mutate: mutateUser } = useSWR(
    `/api/admin-panel/platform-users/${userId}`,
    fetcher,
    { fallbackData: initialUser, refreshInterval: 1000 },
  );

  const { data: ordersData } = useSWR(
    `/api/admin-panel/serum-orders?userId=${userId}`,
    fetcher,
    { fallbackData: { orders: initialOrders }, refreshInterval: 1000 },
  );

  const { data: transactionsData } = useSWR(
    `/api/admin/transactions?userId=${userId}&page=1&limit=200`,
    fetcher,
    { fallbackData: { data: initialTransactions }, refreshInterval: 1000 },
  );

  const liveOrders = ordersData?.orders || [];
  const liveTransactions = transactionsData?.data || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = liveTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(liveTransactions.length / itemsPerPage);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const walletData = [
    { name: "Deposit", amount: user.depositBalance || 0, color: "#2563eb" },
    {
      name: "Available",
      amount: user.availableWithdraw || 0,
      color: "#16a34a",
    },
    { name: "Commission", amount: user.commissionRate || 0, color: "#7c3aed" },
  ];

  const handleTrxStatus = (trxId: string, status: string) => {
    startTransition(async () => {
      const res = await updateTrxStatus(trxId, status, userId);
      if (res?.success) {
        toast.success(res.success);
        router.refresh();
      } else {
        toast.error(res?.error || "Error updating status");
      }
    });
  };

  const getTrxStatusStyle = (status: string) => {
    const styles: any = {
      Completed: "bg-green-500/10 text-green-600 border-green-500/20",
      Rejected: "bg-red-500/10 text-red-600 border-red-500/20",
      "In Progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      Pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    };
    return styles[status] || styles.Pending;
  };

  return (
    <div className="lg:p-6 gap-6 lg:gap-0 lg:space-y-6 user-profile-admin-page-single">
      <div className="text-sm text-muted-foreground flex gap-2 lg:py-0 py-6 items-center">
        <span
          className="cursor-pointer hover:text-primary"
          onClick={() => router.push("/admin")}
        >
          Dashboard
        </span>
        <span>/</span>
        <span
          className="cursor-pointer hover:text-primary"
          onClick={() => router.push("/admin/users")}
        >
          Users
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">{user.fullName}</span>
        {isPending && (
          <Loader2 className="ml-4 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      <Card className="p-6 lg:mb-0 mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
        <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row items-center">
          <img
            src={user.avatar || "/img/avatar.png"}
            className="lg:w-28 lg:h-28 h-40 w-40 rounded-full object-cover border"
            alt="avatar"
          />
          <div className="space-y-1 text-center lg:text-left">
            <h1 className="lg:text-3xl md:text-3xl text-2xl font-bold">
              {user.fullName}
            </h1>
            <p
              className="text-muted-foreground cursor-pointer hover:underline"
              onClick={() => copy("Email", user.email)}
            >
              {user.email}
            </p>
            <div className="flex flex-wrap gap-3 text-sm lg:mt-2 mt-4 justify-center lg:justify-start">
              <Badge label="Status" value={user.status} />
              <Badge label="Plan" value={user.plan} />
              <Badge label="Country" value={user.country} />
            </div>
          </div>
        </div>
        <Button onClick={() => setEditOpen(true)} className="lg:w-25 w-full">
          Edit User
        </Button>
      </Card>

      <div className="grid grid-cols-1 mt-6 md:grid-cols-3 gap-4">
        <StatCard title="Deposit Balance" value={`$${user.depositBalance}`} />
        <StatCard
          title="Available Withdraw"
          value={`$${user.availableWithdraw}`}
        />
        <StatCard title="Commission Rate" value={`${user.commissionRate}%`} />
      </div>

      <Card
        className="p-0 overflow-hidden mt-6 border-none shadow-lg"
        id="transactions"
      >
        <div className="p-6 border-b bg-muted/30">
          <h2 className="text-lg font-bold uppercase tracking-tighter text-primary">
            Financial History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-[11px] uppercase font-black tracking-widest">
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentTransactions.map((t: any) => (
                <tr
                  key={t._id}
                  className="hover:bg-muted/20 transition-all group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border flex items-center justify-center bg-background">
                        {t.type === "Deposit" ? (
                          <ArrowDownLeft size={14} className="text-green-500" />
                        ) : t.type === "Withdraw" ? (
                          <ArrowUpRight size={14} className="text-red-500" />
                        ) : (
                          <BadgePercent size={14} className="text-purple-500" />
                        )}
                      </div>
                      <span className="font-bold">{t.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`font-black ${t.type === "Withdraw" ? "text-red-500" : "text-green-600"}`}
                    >
                      {t.type === "Withdraw" ? "-" : "+"}${t.amount}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-black border uppercase ${getTrxStatusStyle(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={isPending || t.status === "Completed"}
                        onClick={() => handleTrxStatus(t._id, "Completed")}
                        className="p-1 text-green-600 hover:scale-110 disabled:opacity-20 transition-all"
                      >
                        <ShieldCheck size={18} />
                      </button>
                      <button
                        disabled={isPending || t.status === "Rejected"}
                        onClick={() => handleTrxStatus(t._id, "Rejected")}
                        className="p-1 text-red-600 hover:scale-110 disabled:opacity-20 transition-all"
                      >
                        <Ban size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {liveTransactions.length > itemsPerPage && (
          <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-bold uppercase"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-bold uppercase"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 uppercase tracking-tighter">
          User Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info
            label="User ID"
            value={user._id}
            copyable
            onCopy={() => copy("User ID", user._id)}
          />
          <Info label="Phone" value={user.phone || "-"} />
          <Info label="City" value={user.city} />
          <Info label="Address" value={user.address} />
          <Info label="IP Address" value={user.ipAddress || "-"} />
          <Info
            label="Joined"
            value={new Date(user.createdAt).toLocaleString()}
          />
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 uppercase tracking-tighter">
          Wallet Overview
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={walletData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {walletData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 mt-6" id="serum-orders">
        <h2 className="text-lg font-semibold mb-4 uppercase tracking-tighter">
          Serum Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 font-bold">
              <tr>
                <th className="text-left p-3 uppercase text-[11px]">Serum</th>
                <th className="p-3 text-center uppercase text-[11px]">
                  Status
                </th>
                <th className="p-3 text-center uppercase text-[11px]">
                  Tracking #
                </th>
                <th className="p-3 text-center uppercase text-[11px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {liveOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <SearchX
                        size={48}
                        className="text-muted-foreground/20 mb-4"
                      />
                      <h3 className="text-lg font-bold">No Serum Records Found</h3>
                      <p>This user serum data not found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                liveOrders.map((o: any) => (
                  <SerumRow key={o._id} order={o} userId={userId} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editOpen && (
        <EditUserModal
          user={user}
          onClose={() => setEditOpen(false)}
          onUpdated={() => {
            mutateUser();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function SerumRow({ order, userId }: any) {
  const [edit, setEdit] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const res = await updateSerumOrderAction(
        order._id,
        status,
        tracking,
        userId,
      );
      if (res.success) {
        toast.success(res.success);
        setEdit(false);
      } else {
        toast.error(`${res.error}`);
      }
    });
  };

  return (
    <tr className="border-b hover:bg-muted/10 transition-colors">
      <td className="p-3 flex items-center gap-3">
        <img
          src={order.serumPic || "/img/serum.png"}
          className="w-10 h-10 rounded border object-cover"
        />
        <span className="font-medium">{order.serumName}</span>
      </td>
      <td className="p-3 text-center">
        {edit ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-1 py-1 text-xs"
          >
            <option value="processing">Processing</option>
            <option value="dispatched">Dispatched</option>
            <option value="received">Received</option>
          </select>
        ) : (
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${order.status === "received" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
          >
            {order.status}
          </span>
        )}
      </td>
      <td className="p-3 text-center font-mono text-xs">
        {edit ? (
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-24"
          />
        ) : (
          order.trackingNumber || "-"
        )}
      </td>
      <td className="p-3 text-center">
        {edit ? (
          <div className="flex justify-center gap-2">
            <button disabled={isPending} onClick={save}>
              <Check className="w-4 h-4 text-green-600" />
            </button>
            <button onClick={() => setEdit(false)}>
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEdit(true)}>
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

function StatCard({ title, value }: any) {
  return (
    <Card className="p-4 border-none shadow-md bg-card">
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
        {title}
      </p>
      <p className="text-2xl font-black mt-1 text-primary">{value}</p>
    </Card>
  );
}

function Badge({ label, value }: any) {
  return (
    <div className="px-3 py-1 rounded-md bg-muted text-[11px] font-bold border uppercase tracking-tighter">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function Info({ label, value, copyable, onCopy }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-bold text-sm truncate ${copyable ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
        onClick={copyable ? onCopy : undefined}
      >
        {value}
      </span>
    </div>
  );
}
