import DepositClientUI from "./DepositClientUI";
import { serverApiFetch } from "@/lib/server-api";

async function getDepositData() {
  try {
    const [summaryRes, transactionsRes] = await Promise.all([
      serverApiFetch<{
        investedBalance?: number;
        pendingDeposit?: number;
        depositBalance?: number;
      }>("/api/wallet/summary", {
        method: "GET",
        authCookie: "auth_token",
        next: { revalidate: 30, tags: ["deposit"] },
      }),
      serverApiFetch<{ transactions: any[] }>("/api/wallet/transactions", {
        method: "GET",
        authCookie: "auth_token",
        next: { revalidate: 30, tags: ["deposit"] },
      }),
    ]);

    if (!summaryRes.success || !summaryRes.data) return null;

    return {
      summary: {
        investedBalance: summaryRes.data.investedBalance || 0,
        pendingDeposit: summaryRes.data.pendingDeposit || 0,
        depositBalance: summaryRes.data.depositBalance || 0,
      },
      transactions: (transactionsRes.data?.transactions || []).map((tx: any) => ({
        ...tx,
        _id: tx._id,
        type: tx.type || "Transaction",
        status: tx.status || "Pending",
        amount: Number(tx.amount || 0),
        from: tx.from || tx.description || tx.type || "N/A",
        date: tx.date || (tx.createdAt ? new Date(tx.createdAt).toDateString() : ""),
      })),
    };
  } catch (err) {
    console.error("Deposit data error:", err);
    return null;
  }
}

export default async function DepositPage() {
  const data = await getDepositData();
  if (!data) return <div>Unauthorized</div>;

  return (
    <DepositClientUI
      initialSummary={data.summary}
      initialTransactions={data.transactions}
    />
  );
}
