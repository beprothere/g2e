import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-foreground text-background border-t">
      <div className="max-w-7xl mx-auto px-4 pb-20 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-2"
              aria-label="Go to homepage"
            >
              <img
                src="/img/logo1.png"
                alt="Glow2Earn logo"
                width={160}
                height={77}
                loading="lazy"
                decoding="async"
                className="h-auto w-30 sm:w-40"
              />
            </Link>
            <p className="text-sm opacity-75">Earn rewards through referrals and unlock investor potential.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#how-it-works" className="opacity-75 hover:opacity-100 transition">
                  How It Works
                </Link>
              </li>
              
              <li>
                <Link href="/#investor-plans" className="opacity-75 hover:opacity-100 transition">
                  Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" prefetch={false} className="opacity-75 hover:opacity-100 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/get-in-touch" prefetch={false} className="opacity-75 hover:opacity-100 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" prefetch={false} className="opacity-75 hover:opacity-100 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" prefetch={false} className="opacity-75 hover:opacity-100 transition">
                  Terms &amp; Conditions 
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" prefetch={false} className="opacity-75 hover:opacity-100 transition">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-75">© 2026 Glow2Earn. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  )
}
