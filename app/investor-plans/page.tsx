import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import PlanClientWrapper from "./plan-client-wrapper";
import { serverApiFetch } from "@/lib/server-api";
import { headers } from "next/headers";

async function getReferrallink() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const response = await serverApiFetch<{
      userReferralCode?: string;
      referralCode?: string;
    }>("/api/referral/overview", {
      method: "GET",
      authCookie: "auth_token",
      cache: "no-store",
    });

    const referralCode = response?.data?.referralCode || response?.data?.userReferralCode;
    const referralLink = `${protocol}://${host}/signup?ref=${referralCode || ""}`;
    return referralLink;
  } catch (err) {
    console.error("Referral Data Error:", err);
    return "";
  }
}

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
        cache: "no-store",
      }),
      serverApiFetch<{ transactions: any[] }>("/api/wallet/transactions", {
        method: "GET",
        authCookie: "auth_token",
        cache: "no-store",
      }),
    ]);

    if (!summaryRes.success || !summaryRes.data) return null;

    return {
      summary: {
        investedBalance: summaryRes.data.investedBalance || 0,
        pendingDeposit: summaryRes.data.pendingDeposit || 0,
        depositBalance: summaryRes.data.depositBalance || 0,
      },
      transactions: (transactionsRes.data?.transactions || []).map(
        (tx: any) => ({
          ...tx,
          _id: tx._id,
          type: tx.type || "Transaction",
          status: tx.status || "Pending",
          amount: Number(tx.amount || 0),
          from: tx.from || tx.description || tx.type || "N/A",
          date:
            tx.date ||
            (tx.createdAt ? new Date(tx.createdAt).toDateString() : ""),
        }),
      ),
    };
  } catch (err) {
    console.error("Deposit data error:", err);
    return null;
  }
}

export default async function InvestorPlansPage() {
  const referalLink = await getReferrallink();
  const data = await getDepositData();
  const response = await serverApiFetch<{
    userData: {
      plan: string;
      fullName: string;
      planPrice: number;
      commissionRate: number;
      planStatus: string;
      level1Count: number;
      depositBalance: number;
      availableWithdraw: number;
    };
    plans: Array<{
      id: string;
      name: string;
      price: number;
      refsRequired: number;
      commission: number;
      descriptions: string[];
    }>;
  }>("/api/plans/overview", {
    method: "GET",
    authCookie: "auth_token",
    cache: "no-store",
  });

  if (!response.success || !response.data?.userData) {
    redirect("/login");
  }

  const serializedPlans = (response.data.plans || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    invest: `$${p.price}`,
    price: p.price,
    members: p.refsRequired,
    earnings: `${p.commission}%`,
    features: p.descriptions,
    commission: p.commission,
  }));
 
  return (
    <DashboardLayout>
      <PlanClientWrapper
        initialPlans={serializedPlans}
        userData={response.data.userData}
        referralLink={referalLink}
        initialTransactions={data?.transactions}
      />
    </DashboardLayout>
  );
}