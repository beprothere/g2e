import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Gift, Lock } from "lucide-react";
import Link from "next/link";
import FAQ from "@/components/FAQ";
import InvestorPlans from "@/components/InvestorPlans";
import RewardsHome from "./RewardsHome";
import { Suspense } from "react";
import {
  BackToTopClient,
  TestimonialSliderClient,
  VideoSectionClient,
} from "./home-dynamic-client";

function SectionFallback({ height = "h-96" }: { height?: string }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`w-full rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse ${height}`}
        />
      </div>
    </section>
  );
}

export default function Home() {
  const heroCtaLink = "/signup";
  const finalCtaLink = "/signup";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                ✨ Join 10,000+ Earners
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-balance">
              Earn Money Through{" "}
              <span className="gradient-text">Smart Referrals</span>
            </h1>

            <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
              Sign up with a $20 deposit, get premium serum, and start earning
              30% on every referral. Unlock investor plans to earn up to 65% per
              signup.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/90"
              >
                <Link href={heroCtaLink} prefetch={false}>
                  Get Started Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>

            <div className="pt-8 flex justify-center gap-8 text-sm text-foreground/70 flex-wrap">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-accent" />
                Secure & Verified
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-accent" />
                10,000+ Members
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                $2M+ Paid Out
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-foreground/70">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Deposit",
                description:
                  "Create an account and make a $20 deposit. Receive premium serum within 2-3 days.",
                icon: Gift,
              },
              {
                step: "2",
                title: "Get Referral Link",
                description:
                  "Get your unique referral link instantly. Share it with friends and earn 30% per signup.",
                icon: Users,
              },
              {
                step: "3",
                title: "Unlock Rewards",
                description:
                  "Watch earnings grow. Unlock investor plans and earn up to 65% per referral.",
                icon: TrendingUp,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card
                  key={i}
                  className="glass border-primary/20 p-8 hover:shadow-premium transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-r from-primary to-secondary flex items-center justify-center text-white font-bold mb-6">
                    {item.step}
                  </div>
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-foreground/70">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <VideoSectionClient />

      <Suspense fallback={<SectionFallback />}>
        <RewardsHome />
      </Suspense>

      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Multi-Level Earnings
            </h2>
            <p className="text-lg text-foreground/70">
              Earn on direct referrals and their network
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                level: "Level 1 - Direct Referral",
                earning: "30%",
                description:
                  "Someone signs up with your link → You earn 30% of their $20 deposit",
                color: "from-primary",
              },
              {
                level: "Level 2 - Indirect Referral",
                earning: "5%",
                description:
                  "Your referral refers someone → You earn 5%, they earn 30%",
                color: "from-secondary",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className={`glass border-primary/20 p-8 bg-linear-to-br ${item.color} to-transparent/5`}
              >
                <h3 className="text-2xl font-bold mb-2">{item.level}</h3>
                <div className="text-5xl font-bold text-primary mb-4">
                  {item.earning}
                </div>
                <p className="text-foreground/70 text-lg">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<SectionFallback />}>
        <InvestorPlans />
      </Suspense>

      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Earners
            </h2>
            <p className="text-lg text-foreground/70">
              See what our community has to say
            </p>
          </div>

          <TestimonialSliderClient />
        </div>
      </section>

      <FAQ />

      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Join thousands of successful earners. Sign up today and get your
            first referral link.
          </p>

          <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
            <Link href={finalCtaLink} prefetch={false}>
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
      <BackToTopClient />
    </div>
  );
}
