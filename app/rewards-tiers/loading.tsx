import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function RewardsTiersLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <section className="pb-2 pt-2 md:pt-8 md:pb-2">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Progress</h2>
              <p className="text-lg text-foreground/70">Track your journey to the top</p>
            </div>

            <Card className="glass border-primary/20 p-8 md:p-12">
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-sm text-foreground/60">Target Tier</p>
                  <Skeleton className="h-9 w-48 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold">Progress to next reward</span>
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <Skeleton className="h-4 w-1/2 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <Skeleton className="h-4 w-32" />
                    <Button size="lg" disabled>
                      Locked
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-12 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                All Achievement Tiers
              </h2>
            </div>
            <div className="space-y-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="glass border-primary/20 p-6 md:p-10 transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                    <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-3xl shrink-0" />
                    <div className="grow space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-2 shrink-0">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
