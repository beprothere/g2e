"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth-actions";

import {
  Home,
  LayoutGrid,
  Link2,
  TrendingUp,
  Wallet,
  Settings,
  Trophy,
  Users,
  HandCoins,
} from "lucide-react";

const navMobItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/referral", label: "Referral Link", icon: Link2 },
  { href: "/team", label: "Your Team", icon: Users },
  { href: "/rewards-tiers", label: "Achievements", icon: Trophy },
  { href: "/investor-plans", label: "Investor Plans", icon: TrendingUp },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: Settings },
];

export default function NavbarClient({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuId = "mobile-primary-nav";
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    await logoutAction();
    window.dispatchEvent(new Event("user-logout"));
    localStorage.removeItem("profileStatus");
    setShowLogoutConfirm(false);
    setIsOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-2"
            aria-label="Go to homepage"
          >
            <Image
              src="/img/logo1.png"
              alt="Glow2Earn logo"
              width={180}
              height={86}
              priority
              className="h-auto w-24 sm:w-28 lg:w-35"
            />
          </Link>

          <div className="hidden md:flex gap-8">
            <Link
              href="/#how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="/#rewards"
              className="text-sm font-medium hover:text-primary"
            >
              Rewards
            </Link>
            <Link
              href="/#investor-plans"
              className="text-sm font-medium hover:text-primary"
            >
              Invest
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium hover:text-primary"
            >
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex gap-3 items-center">
            {!user ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login" prefetch={false}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup" prefetch={false}>
                    Sign Up
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  prefetch={false}
                  aria-label="Open profile"
                >
                  <Image
                    src={user.avatar || "/img/avatar.png"}
                    alt={`${user.fullName || "User"} avatar`}
                    width={36}
                    height={36}
                    className="rounded-full border cursor-pointer"
                  />
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut size={18} /> Logout
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden lg:hidden p-2 rounded-sm bg-linear-to-tr from-indigo-500 to-cyan-400 text-white"
            type="button"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div
            id={mobileMenuId}
            ref={menuRef}
            className="md:hidden pb-4 space-y-3"
            onClick={() => setIsOpen(!isOpen)}
          >
            {user ? (
              <div className="flex flex-col gap-4 pt-4">
                {navMobItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <span className="flex items-center gap-3 px-0 py-0">
                        <Icon size={18} />
                        <span className="font-medium">{item.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-4">
                <Link
                  href="/"
                  prefetch={false}
                  className="text-sm font-medium hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  href="/#how-it-works"
                  className="text-sm font-medium hover:text-primary"
                >
                  How It Works
                </Link>
                <Link
                  href="/#rewards"
                  className="text-sm font-medium hover:text-primary"
                >
                  Rewards
                </Link>
                <Link
                  href="/#investor-plans"
                  className="text-sm font-medium hover:text-primary"
                >
                  Invest
                </Link>
                <Link
                  href="/#faq"
                  className="text-sm font-medium hover:text-primary"
                >
                  FAQ
                </Link>
              </div>
            )}

            {!user ? (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/login" prefetch={false}>
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href="/signup" prefetch={false}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild className="flex-1">
                  <Link href="/profile" prefetch={false}>
                    <UserIcon size={16} /> Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut size={18} /> Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 h-screen bg-black/50 flex p-4 items-center justify-center z-999">
          <div className="bg-white border border-primary/20 rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-center">Confirm Logout</h2>
            <p className="text-sm text-center text-foreground/70">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleLogout}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
