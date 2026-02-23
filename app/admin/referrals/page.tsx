import { ReferralStats } from "@/app/components/admin/referral-stats"
import { ReferralTree } from "@/app/components/admin/referral-tree"
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: 'Referral Management - Admin Dashboard',
}

function ReferralStatsFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {["Total Referrals", "Commissions", "Active Referrers"].map((label) => (
        <Card key={label} className="p-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Skeleton className="h-8 w-24 mt-3" />
          <Skeleton className="h-3 w-20 mt-3" />
        </Card>
      ))}
    </div>
  );
}

function ReferralTreeFallback() {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Referral Tree</h3>
      {Array.from({ length: 8 }).map((_, index) => (
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

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referral Management</h1>
        <p className="text-muted-foreground mt-1">Track referral chains, earnings, and distributions</p>
      </div>
      
      <Suspense fallback={<ReferralStatsFallback />}>
        <ReferralStats />
      </Suspense>

      <Suspense fallback={<ReferralTreeFallback />}>
        <ReferralTree />
      </Suspense>
    </div>
  )
}
