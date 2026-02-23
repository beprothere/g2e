import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
            <p className="text-foreground/70">
              Please read these terms carefully before using our platform.
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-sm text-foreground/80">
                By accessing or using this website and our services, you agree
                to be bound by these Terms & Conditions. If you do not agree with
                any part of these terms, you must not use our platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. User Eligibility</h2>
              <p className="text-sm text-foreground/80">
                You must be at least 18 years old to use our services. By using
                this platform, you confirm that you meet this requirement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Account Responsibility</h2>
              <p className="text-sm text-foreground/80">
                You are responsible for maintaining the confidentiality of your
                account credentials. Any activity performed using your account
                will be considered your responsibility.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Two-Factor Authentication</h2>
              <p className="text-sm text-foreground/80">
                For security purposes, we may require two-factor authentication
                (2FA). You agree to comply with all security measures implemented
                on the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Prohibited Activities</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1">
                <li>Unauthorized access to other accounts</li>
                <li>Attempting to bypass security mechanisms</li>
                <li>Providing false or misleading information</li>
                <li>Any activity that violates applicable laws</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Payments & Subscriptions</h2>
              <p className="text-sm text-foreground/80">
                All payments are non-refundable unless explicitly stated
                otherwise. Subscription features are activated only after
                successful payment verification.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Account Suspension</h2>
              <p className="text-sm text-foreground/80">
                We reserve the right to suspend or terminate your account at any
                time if we detect suspicious activity or violation of these
                terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
              <p className="text-sm text-foreground/80">
                We shall not be liable for any direct, indirect, or incidental
                damages arising from the use or inability to use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">9. Privacy</h2>
              <p className="text-sm text-foreground/80">
                Your use of the platform is also governed by our Privacy Policy.
                We are committed to protecting your personal data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
              <p className="text-sm text-foreground/80">
                We may update these Terms & Conditions at any time. Continued
                use of the platform after changes means you accept the updated
                terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">11. Governing Law</h2>
              <p className="text-sm text-foreground/80">
                These terms shall be governed and interpreted in accordance with
                applicable local laws.
              </p>
            </section>

            <div className="pt-6 border-t text-sm text-foreground/70">
              <p>
                If you have any questions about these Terms & Conditions, please
                contact our support team.
              </p>
              <p className="mt-2">
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
