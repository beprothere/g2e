import { headers } from "next/headers";
import ReferralClientUI from "./ReferralClientUI";
import { serverApiFetch } from "@/lib/server-api";

async function getReferralData() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const response = await serverApiFetch<{
      stats: {
        level1Count: number;
        level2Count: number;
        totalWithdrawBalance: number;
      };
      referralTree: Array<{
        name: string;
        email: string;
        date: string;
        status: string;
        earnings: number;
        children?: Array<{
          name: string;
          email: string;
          date: string;
          status: string;
          earnings: number;
        }>;
      }>;
      userReferralCode?: string;
      referralCode?: string;
    }>("/api/referral/overview", {
      method: "GET",
      authCookie: "auth_token",
      next: { revalidate: 30, tags: ["referral"] },
    });

    if (!response.success || !response.data) return null;

    const referralCode = response.data.referralCode || response.data.userReferralCode;
    const referralLink = `${protocol}://${host}/signup?ref=${referralCode || ""}`;
    const referralTreeSource = response.data.referralTree || [];

    const l1Sum = referralTreeSource.reduce(
      (acc, curr: any) => acc + Number(curr.earnings || 0),
      0,
    );

    const l2Sum = referralTreeSource.reduce(
      (acc, curr: any) =>
        acc +
        (curr.children || []).reduce(
          (childSum: number, child: any) => childSum + Number(child.earnings || 0),
          0,
        ),
      0,
    );

    const referralTree = referralTreeSource.slice(0, 5).map((l1: any) => ({
      name: l1.name,
      email: l1.email,
      date: new Date(l1.date).toLocaleDateString(),
      status: l1.status || "Verified",
      earnings: Number(l1.earnings || 0).toFixed(2),
      children: (l1.children || []).slice(0, 5).map((l2: any) => ({
        name: l2.name,
        email: l2.email,
        date: new Date(l2.date).toLocaleDateString(),
        status: l2.status || "Verified",
        earnings: Number(l2.earnings || 0).toFixed(2),
      })),
    }));

    return {
      referralLink,
      stats: [
        {
          label: "Level 1 Referrals",
          value: String(response.data.stats?.level1Count || 0),
          earnings: `$${l1Sum.toFixed(2)}`,
          icon: "Users",
        },
        {
          label: "Level 2 Referrals",
          value: String(response.data.stats?.level2Count || 0),
          earnings: `$${l2Sum.toFixed(2)}`,
          icon: "TrendingUp",
        },
        {
          label: "Total Earnings",
          value: `$${Number(response.data.stats?.totalWithdrawBalance || 0).toFixed(2)}`,
          icon: "Users",
        },
      ],
      referralTree,
    };
  } catch (err) {
    console.error("Referral Data Error:", err);
    return null;
  }
}

export default async function Referral() {
  const data = await getReferralData();
  if (!data) return <div>Unauthorized</div>;

  return <ReferralClientUI initialData={data} />;
}
