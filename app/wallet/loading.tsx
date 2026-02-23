import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
          <p className="text-foreground/70">
            Manage your funds and track transactions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Total Earned", "Pending", "Available to Withdraw"].map((label) => (
            <Card
              key={label}
              className="glass border-primary/20 p-6 bg-linear-to-br from-primary/10 to-transparent"
            >
              <p className="text-sm text-foreground/60 mb-2">{label}</p>
              <Skeleton className="h-9 w-28 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>

        <Card className="glass border-primary/20 p-6">
          <h3 className="text-lg font-bold mb-6">Withdrawal Settings</h3>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
