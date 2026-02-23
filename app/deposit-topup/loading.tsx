import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepositTopupLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Top Up Funds</h1>
          <p className="text-foreground/70">
            Manage your wallet and top up funds to start earning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Total Deposit", "Pending Deposit", "Available Deposit"].map((label) => (
            <Card
              key={label}
              className="glass border-primary/20 p-6 bg-linear-to-br from-primary/10 to-transparent"
            >
              <p className="text-sm text-foreground/60 mb-2">{label}</p>
              <Skeleton className="h-9 w-28 mb-2" />
              <Skeleton className="h-3 w-36" />
            </Card>
          ))}
        </div>

        <Card className="glass border-primary/20 p-6 transaction-card">
          <h3 className="text-lg font-bold mb-6">Transaction History</h3>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
