import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { serverApiFetch } from "@/lib/server-api";

const InvestorPlans = async () => {
  let plans: any[] = [];

  try {
    const response = await serverApiFetch<{ success: boolean; plans: any[] }>(
      "/api/admin/plans",
      {
        method: "GET",
        next: { revalidate: 60, tags: ["investor-plans"] },
      },
    );

    const allPlans =
      response.success && response.data?.success ? response.data.plans || [] : [];
    plans = allPlans
      .filter((plan: any) => String(plan.status || "").toLowerCase() === "active")
      .slice(0, 100);
  } catch (error) {
    console.error("Error fetching plans:", error);
    plans = [];
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-10">No plans available at the moment.</div>
    );
  }

  return (
    <section id="investor-plans" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Investor Plans
          </h2>
          <p className="text-lg text-foreground/70">
            Unlock higher earnings with our investor tiers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan: any) => {
            const isHighlighted = plan.price === 200;

            return (
              <Card
                key={String(plan._id)}
                className={`glass border-primary/20 p-8 transition-all duration-300 ${
                  isHighlighted
                    ? "ring-2 ring-primary scale-105 shadow-premium"
                    : "hover:shadow-premium"
                }`}
              >
                <h3 className="text-2xl font-bold mb-4">{plan.name} Plan</h3>

                <div className="mb-6">
                  <p className="text-sm text-foreground/70 mb-1">
                    Initial Investment
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    ${plan.price}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-foreground/70 mb-1">
                      Members to Add
                    </p>
                    <p className="text-xl font-bold">
                      {plan.refsRequired} people
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70 mb-1">
                      ROI / Commission
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {plan.commission}%
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={isHighlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/investor-plans">View Details</Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InvestorPlans;
