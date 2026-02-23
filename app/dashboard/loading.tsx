import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const statLabels = [
  "Total Earned",
  "Direct Referrals",
  "Level 2 Referrals",
  "Pending Deposit",
];

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Dashboard</h1>
          <p className="text-muted-foreground font-medium">
            Welcome back! Here's your referral overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statLabels.map((label) => (
            <Card
              key={label}
              className="glass border-primary/20 p-6 hover:shadow-lg transition-shadow"
            >
              <p className="text-sm text-foreground/60 font-bold">{label}</p>
              <Skeleton className="mt-2 h-8 w-24" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass border-primary/20 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-6 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-bold text-lg"
                  asChild
                >
                  <Link href="/referral">View Referral Link</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 bg-transparent border-2 rounded-xl font-bold"
                  asChild
                >
                  <Link href="/wallet">Withdraw Earnings</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="glass border-primary/20 p-6">
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider">Serum</h3>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </Card>
        </div>

        <Card className="glass border-primary/20 p-6 recent-dah-referal-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase tracking-wider">
              Recent Referrals
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-2 font-bold px-4"
              asChild
            >
              <Link href="/team">View All</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-primary/10"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
