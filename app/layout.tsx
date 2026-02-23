import "./globals.css";
import type React from "react";
import { Poppins } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import NavbarWrapper from "@/components/layout/NavbarWrapper";
import LayoutClientRuntime from "./layout-client-runtime";
import MobNav from "@/components/layout/MobNav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Glow2Earn - Earn & Invest With Referrals",
  description:
    "Join our deposit-based referral program. Earn 30% on direct referrals, unlock investor plans, and grow your earnings.",
  // generator: "v0.app",
  // manifest: "/manifest.json",
  // appleWebApp: {
  //   capable: true,
  //   statusBarStyle: "default",
  //   title: "Glow 2 Earn",
  // },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${poppins.className} font-sans antialiased overflow-x-hidden max-w-screen`}>
        <LayoutClientRuntime />
        <NavbarWrapper />

        <main id="main-content w-full overflow-x-hidden">{children}</main>

        <Analytics />
        <MobNav />
      </body>
    </html>
  );
}
