import WalletOverviewClient from "./wallet-overview.client";
import { serverApiFetch } from "@/lib/server-api";

export default async function WalletOverviewServer() {
  const response = await serverApiFetch<{
    deposits: number;
    withdrawals: number;
    lockedWallets: number;
    activeWallets: number;
    manual: { 
      count: number; 
      plus: number;      
      commission: number; 
      minus: number;   
    };
  }>("/api/admin/wallet-overview", {
    method: "GET",
    authCookie: "admin_token",
  });

  const data = response.success && response.data
    ? response.data
    : {
        deposits: 0,
        withdrawals: 0,
        lockedWallets: 0,
        activeWallets: 0,
        manual: { count: 0, plus: 0, commission: 0, minus: 0 },
      };

  return <WalletOverviewClient initialData={data} />;
}