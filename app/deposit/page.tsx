import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Check, Zap } from "lucide-react"

export default function DepositPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Complete Your Deposit</h1>
            <p className="text-foreground/70">
              Make a $20 deposit to receive your premium serum and activate referral earnings
            </p>
          </div>

          <Card className="glass border-primary/20 p-8">
            <div className="space-y-8">
              <div className="bg-linear-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
                <p className="text-sm text-foreground/60 mb-2">Deposit Amount</p>
                <p className="text-5xl font-bold text-primary">$20</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">You'll receive:</h3>
                <div className="space-y-3">
                  {[
                    "Premium Serum Product (shipped in 2-3 days)",
                    "Unique Referral Link instantly activated",
                    "Access to investor plan upgrades",
                    "Lifetime earning potential",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Check size={20} className="text-accent shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-accent/10 rounded-lg p-4 flex items-center gap-3">
                <Zap size={20} className="text-accent shrink-0" />
                <p className="text-sm">Secure payment processing. Your data is protected.</p>
              </div>

              <Button size="lg" className="w-full h-12 bg-primary hover:bg-primary/90 text-lg">
                Proceed to Payment
              </Button>

              <p className="text-xs text-center text-foreground/60">
                By clicking above, you agree to our Terms of Service
              </p>
            </div>
          </Card>

          <Card className="glass border-primary/20 p-6">
            <h3 className="font-bold mb-4">Common Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-1">How long does shipping take?</p>
                <p className="text-foreground/70">2-3 business days. You'll get a tracking number.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">What if I have an issue with my product?</p>
                <p className="text-foreground/70">Full 30-day money back guarantee. No questions asked.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
