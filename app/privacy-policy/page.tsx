import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-foreground/70">
              Your privacy is important to us. Please read this policy carefully.
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Information We Collect</h2>
              <p className="text-sm text-foreground/80">
                We collect personal information such as your name, email address,
                IP address, device information, and login activity when you
                register or use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1">
                <li>To create and manage your account</li>
                <li>To provide secure authentication and prevent fraud</li>
                <li>To send important security and service-related emails</li>
                <li>To improve our platform and user experience</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Cookies & Tracking</h2>
              <p className="text-sm text-foreground/80">
                We use cookies and similar technologies to maintain sessions,
                enhance security, and analyze platform usage. You can control
                cookie settings through your browser.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Data Protection</h2>
              <p className="text-sm text-foreground/80">
                We implement industry-standard security measures, including
                encryption and two-factor authentication, to protect your data
                against unauthorized access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Data Sharing</h2>
              <p className="text-sm text-foreground/80">
                We do not sell or rent your personal information to third
                parties. Your data may only be shared when required by law or
                to protect our legal rights.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Account Security</h2>
              <p className="text-sm text-foreground/80">
                You are responsible for keeping your account credentials secure.
                Any activity performed through your account will be considered
                your responsibility.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Changes to This Policy</h2>
              <p className="text-sm text-foreground/80">
                We may update this Privacy Policy from time to time. Continued
                use of our services after updates means you accept the revised
                policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. Contact Us</h2>
              <p className="text-sm text-foreground/80">
                If you have any questions or concerns about this Privacy Policy,
                please contact our support team.
              </p>
            </section>

            <div className="pt-6 border-t text-sm text-foreground/70">
              <p>
                Need {" "}
                <Link href="/get-in-touch" className="text-primary font-medium">
                  Help
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
