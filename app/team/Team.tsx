import TeamClientUI from "./TeamClientUI";
import { serverApiFetch } from "@/lib/server-api";
import { headers } from "next/headers";

async function getTeamInitialData() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const response = await serverApiFetch<{
      referralCode?: string;
      referralTree: any[];
    }>("/api/referral/overview", {
      method: "GET",
      authCookie: "auth_token",
      next: { revalidate: 0 }, 
    });

    if (!response.success) return null;

    const referralCode = response.data?.referralCode;
    const referralLink = `${protocol}://${host}/signup?ref=${referralCode || ""}`;

    return { referralLink };
  } catch (err) {
    console.error("Team Data Fetch Error:", err);
    return null;
  }
}

export default async function Team() {
  const data = await getTeamInitialData();
  const referralLink = data?.referralLink || "";

  return <TeamClientUI referralLink={referralLink} />;
}