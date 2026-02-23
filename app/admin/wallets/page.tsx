import { Suspense } from "react";
import { MerchantWallets } from "@/app/components/admin/merchant-wallets";
import WalletOverviewServer from "@/app/components/admin/wallet-overview.server";
import TransactionLedgerServer from "@/app/components/admin/transaction-ledger.server";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApiFetch } from "@/lib/server-api";
import { ManualWallets } from "@/app/components/admin/ManualWalletsSection";

export const metadata = {
  title: "Wallet Management - Admin Dashboard",
};

type WalletSearchParams = { page?: string; type?: string };

function WalletCardsFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {["EasyPaisa", "JazzCash", "Bank Wallet"].map((label) => (
        <Card key={label} className="p-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Skeleton className="h-8 w-24 mt-3" />
          <Skeleton className="h-3 w-20 mt-3" />
        </Card>
      ))}
    </div>
  );
}

function WalletOverviewFallback() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">Wallet Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["Total Balance", "Pending", "Available"].map((label) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <Skeleton className="h-7 w-20 mt-2" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function LedgerFallback() {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Transaction Ledger</h3>
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </Card>
  );
}

async function MerchantWalletsSection() {
  const response = await serverApiFetch<any[]>("/api/admin/merchant-wallets", {
    method: "GET",
    authCookie: "admin_token",
  });

  const wallets = response.success ? response.data || [] : [];
  return <MerchantWallets initialWallets={wallets} />;
}
async function ManualWalletsSection() {
  const response = await serverApiFetch<any[]>("/api/admin/manual-wallets", {
    method: "GET",
    authCookie: "admin_token",
  });

  const wallets = response.success ? response.data || [] : [];
  return <ManualWallets initialWallets={wallets} />;
}

async function TransactionLedgerSection({
  searchParams,
}: {
  searchParams: Promise<WalletSearchParams>;
}) {
  const sParams = await searchParams;
  return <TransactionLedgerServer searchParams={sParams} />;
}

export default function WalletsPage(props: {
  searchParams: Promise<WalletSearchParams>;
}) {
  return (
    <div className="lg:space-y-8 lg:p-6 md:p-4 p-0">
      <Suspense fallback={<WalletCardsFallback />}>
        <ManualWalletsSection />
      </Suspense>

      <Suspense fallback={<WalletCardsFallback />}>
        <MerchantWalletsSection />
      </Suspense>

      <div className="border-t border-border my-6 lg:my-0" />

      <Suspense fallback={<WalletOverviewFallback />}>
        <WalletOverviewServer />
      </Suspense>

      <Suspense fallback={<LedgerFallback />}>
        <TransactionLedgerSection searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
