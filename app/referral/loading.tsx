import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Referral Program</h1>
          <p className="text-foreground/70">
            Share your link and earn commissions on every signup
          </p>
        </div>

        <Card className="glass border-primary/20 p-4 sm:p-6 md:p-8">
          <h3 className="text-base sm:text-lg font-bold mb-4">Your Unique Referral Link</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-4 w-fit justify-center mb-6">
              <Skeleton className="h-36 w-36 rounded-xl" />
              <strong>Invite More friends</strong>
            </div>
            <p className="text-xs sm:text-sm text-foreground/60 mb-2">
              Share this link with friends:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Skeleton className="h-11 flex-1" />
              <Button className="shrink-0 w-full sm:w-auto">Copy</Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {["Level 1 Referrals", "Level 2 Referrals", "Total Earnings"].map((label) => (
            <Card key={label} className="glass border-primary/20 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-foreground/60 mb-1">{label}</p>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>

        <Card className="glass border-primary/20 p-4 sm:p-6 md:p-8">
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
            Your Referral Network
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-linear-to-r from-primary/10 to-transparent rounded-lg p-3 sm:p-4 border border-primary/20"
              >
                <div className="flex justify-between mb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
