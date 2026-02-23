"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Link2,
  TrendingUp,
  Wallet,
  Settings,
  Trophy,
  Users,
  HandCoins,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/referral", label: "Referral Link", icon: Link2 },
  { href: "/team", label: "Your Team", icon: Users },
  { href: "/rewards-tiers", label: "Achievements", icon: Trophy },
  // { href: "/deposit-topup", label: "Deposit", icon: HandCoins },
  { href: "/investor-plans", label: "Investor Plans", icon: TrendingUp },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card/50 glass">
      <nav className="flex-1 px-6 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-primary" : "group-hover:text-primary transition"}
                />
                <span className="font-medium">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}