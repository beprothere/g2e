import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">

      <div className="py-20 md:py-32">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-foreground/70">Join Glow2Earn and start earning today</p>
            </div>

            <Card className="glass border-primary/20 p-8">
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" type="text" placeholder="John Doe" required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral">Referral Code (Optional)</Label>
                  <Input id="referral" type="text" placeholder="Enter referral code if you have one" className="h-11" />
                  <p className="text-xs text-foreground/60">Got referred? Paste their code to give them credit</p>
                </div>

                <div className="flex items-start gap-2">
                  <input id="terms" type="checkbox" required className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-foreground/70">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button className="w-full h-11 bg-primary hover:bg-primary/90">Create Account</Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-card text-foreground/50">Or sign up with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full h-11 mb-3 bg-transparent">
                Google
              </Button>

              <p className="text-sm text-center text-foreground/70">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </Card>

            <Card className="glass border-accent/20 bg-accent/5 p-6">
              <p className="text-sm text-center">
                <span className="font-semibold">Next:</span> You'll make a $20 deposit and receive your premium serum
                within 2-3 days.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
