import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">


      <div className="py-20 md:py-32">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-foreground/70">Sign in to your Glow2Earn account</p>
            </div>

            <Card className="glass border-primary/20 p-8">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required className="h-11" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" required className="h-11" />
                </div>

                <Button className="w-full h-11 bg-primary hover:bg-primary/90">Sign In</Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-card text-foreground/50">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full h-11 mb-3 bg-transparent">
                Google
              </Button>

              <p className="text-sm text-center text-foreground/70">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
