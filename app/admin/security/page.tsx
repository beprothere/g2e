import { DuplicateIPList } from "@/app/components/admin/duplicate-ip-list"
import { FraudDetection } from "@/app/components/admin/fraud-detection"
import { SecurityStats } from "@/app/components/admin/security-stats"
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: 'Security & Fraud Center - Admin Dashboard',
  description: 'Monitor security threats and suspicious activities',
}

function SecurityStatsFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {["Threats", "Blocked IPs", "Alerts", "Safe Sessions"].map((label) => (
        <Card key={label} className="p-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Skeleton className="h-8 w-20 mt-3" />
          <Skeleton className="h-3 w-16 mt-3" />
        </Card>
      ))}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security & Fraud Center</h1>
        <p className="text-muted-foreground mt-1">Monitor threats, detect fraud, and manage blacklists</p>
      </div>

      <Suspense fallback={<SecurityStatsFallback />}>
        <SecurityStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DuplicateIPList />
        <FraudDetection />
      </div>
    </div>
  )
}
