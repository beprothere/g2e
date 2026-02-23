import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function InvestorPlansLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Plan Budget", "Commission Rate", "Your Team"].map((label) => (
            <Card
              key={label}
              className="glass border-primary/20 p-6 bg-linear-to-br from-primary/10 to-transparent"
            >
              <p className="text-sm text-foreground/60 mb-2">{label}</p>
              <Skeleton className="h-9 w-28 mb-2" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="glass border-primary/20 p-8">
              <div className="mb-6 space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="rounded-lg p-4 mb-6 border border-primary/10">
                <p className="text-sm text-foreground/60 mb-1">Earnings Per Signup</p>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="space-y-3 mb-6">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
              <Button className="w-full" disabled>
                Loading Plan
              </Button>
            </Card>
          ))}
        </div>

        <Card className="glass border-primary/20 p-8">
          <h3 className="text-xl font-bold mb-6">Plan Comparison</h3>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-center">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
