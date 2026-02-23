import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { getRewards } from "@/app/actions/rewardActions";

const iconEmoji: Record<string, string> = {
  Smartphone: "📱",
  Monitor: "📺",
  Bike: "🏍",
  Car: "🚗",
  Gift: "🎁",
  Laptop: "💻",
  Watch: "⌚",
  Trophy: "🏆",
};

const RewardsHome = async () => {
  let sortedRewards = [];

  try {
    const rewards = await getRewards();
    sortedRewards = rewards.sort((a: any, b: any) => a.level - b.level);
  } catch (error) {
    console.error("Error loading rewards:", error);
    // Return empty state instead of throwing
    sortedRewards = [];
  }

  return (
    <section id="rewards" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Achievement Rewards
          </h2>
          <p className="text-lg text-foreground/70">
            Unlock exclusive items as you recruit and grow your network
          </p>
        </div>

        <div className="flex flex-col gap-6 mb-8">
          {sortedRewards.length > 0 ? (
            sortedRewards.map((item: any) => {
              return (
                <Card
                  key={item._id}
                  className={`glass border-primary/20 p-8 bg-linear-to-r ${item.color} via-transparent to-transparent hover:shadow-premium transition-all duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl md:text-7xl filter drop-shadow-md">
                        {iconEmoji[item.icon] || "🎁"}
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl md:text-3xl">
                          Level {item.level}: {item.name}
                        </h3>
                        <p className="text-sm text-foreground/70 mt-1 font-semibold">
                          {item.recruits.toLocaleString()} Recruits Required
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-primary/10">
                      <p className="text-xs text-foreground/70 uppercase tracking-widest font-bold">
                        Reward
                      </p>
                      <p
                        className={`text-2xl md:text-3xl font-black ${item.accentColor.split(" ")[1]}`}
                      >
                        {item.reward}
                      </p>
                    </div>
                  </div>

                  <p className="text-foreground/70 mt-6 ml-0 md:ml-24 leading-relaxed pl-4">
                    {item.description}
                  </p>

                  <div
                    className={`absolute -right-10 -bottom-10 w-40 h-40 bg-linear-to-br ${item.color} opacity-5 blur-3xl rounded-full`}
                  />
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 opacity-50 italic border-2 border-dashed rounded-3xl">
              Abhi tak koi rewards add nahi kiye gaye.
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 rounded-full px-12 shadow-xl shadow-primary/20"
            asChild
          >
            <Link href="/rewards-tiers">View All Tiers & Progress</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RewardsHome;
