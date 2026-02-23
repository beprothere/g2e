"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavbarClient from "./NavbarClient";

const AUTH_ROUTE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/wallet",
  "/referral",
  "/team",
  "/rewards-tiers",
  "/investor-plans",
  "/deposit-topup",
  "/orders",
];

export default function NavbarWrapper() {
  const pathname = usePathname() || "";
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);

  useEffect(() => {
    const handleUserLogout = () => {
      setUser(null);
      setHasFetchedUser(true);
    };
    const handleProfileUpdated = () => {
      setHasFetchedUser(false);
    };

    window.addEventListener("user-logout", handleUserLogout);
    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("user-logout", handleUserLogout);
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    if (hasFetchedUser && (user || !isAuthRoute)) return;

    const shouldFetchImmediately = isAuthRoute;
    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let isMounted = true;
    const controller = new AbortController();
    let idleCallbackId: number | null = null;
    let timeoutId: number | null = null;

    const loadUser = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          if (isMounted) setUser(null);
          return;
        }
        
        const data = await res.json();
        if (isMounted) {
          setUser(data?.user || null);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError" && isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasFetchedUser(true);
        }
      }
    };

    if (shouldFetchImmediately) {
      loadUser();
    } else if (typeof win.requestIdleCallback === "function") {
      idleCallbackId = win.requestIdleCallback(() => {
        loadUser();
      }, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(() => {
        loadUser();
      }, 1000);
    }

    return () => {
      isMounted = false;
      if (idleCallbackId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      controller.abort();
    };
  }, [pathname, hasFetchedUser, user]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <NavbarClient user={user} />;
}
