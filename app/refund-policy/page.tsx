import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Refund Policy</h1>
            <p className="text-foreground/70">
              Please review our refund policy carefully before making a payment.
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Digital Services</h2>
              <p className="text-sm text-foreground/80">
                All services provided on this platform are digital in nature.
                Once access is granted, services are considered delivered.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. No Refund Policy</h2>
              <p className="text-sm text-foreground/80">
                Payments made for subscriptions, memberships, or digital
                services are non-refundable unless explicitly stated otherwise.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Payment Issues</h2>
              <p className="text-sm text-foreground/80">
                If you experience a payment error, duplicate charge, or
                technical issue, please contact our support team within
                48 hours of the transaction.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Service Downtime</h2>
              <p className="text-sm text-foreground/80">
                Temporary service interruptions or maintenance downtime do not
                qualify for refunds.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Fraud & Abuse</h2>
              <p className="text-sm text-foreground/80">
                Any misuse of the platform, violation of terms, or fraudulent
                activity may result in account suspension without eligibility
                for a refund.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
              <p className="text-sm text-foreground/80">
                We reserve the right to modify this Refund Policy at any time.
                Changes will be effective immediately upon posting.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Contact Support</h2>
              <p className="text-sm text-foreground/80">
                For any questions related to payments or refunds, please contact
                our support team with your transaction details.
              </p>
            </section>

            <div className="pt-6 border-t text-sm text-foreground/70">
              <p>
                Back to{" "}
                <Link href="/login" className="text-primary font-medium">
                  Login
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
