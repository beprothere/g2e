"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ProfileAlertClient from "./ProfileAlertClient";

const PROFILE_ALERT_ROUTES = [
  "/dashboard",
  "/wallet",
  "/referral",
  "/team",
  "/rewards-tiers",
  "/investor-plans",
  "/deposit-topup",
  "/orders",
];
const PROFILE_ALERT_CACHE_KEY = "profile-alert-cache";
const PROFILE_ALERT_CACHE_TTL_MS = 60 * 1000;

export default function ProfileAlert() {
  const pathname = usePathname() || "";
  const [missing, setMissing] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const shouldCheckProfile = PROFILE_ALERT_ROUTES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    const handleProfileUpdated = () => {
      try {
        sessionStorage.removeItem(PROFILE_ALERT_CACHE_KEY);
      } catch {}
      setMissing([]);
      setShow(false);
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    if (
      pathname.startsWith("/admin") ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/profile") ||
      !shouldCheckProfile
    ) {
      setShow(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    try {
      const rawCache = sessionStorage.getItem(PROFILE_ALERT_CACHE_KEY);
      if (rawCache) {
        const parsed = JSON.parse(rawCache) as {
          missing?: string[];
          updatedAt?: number;
        };
        const age = Date.now() - Number(parsed?.updatedAt || 0);
        if (
          Array.isArray(parsed?.missing) &&
          age >= 0 &&
          age < PROFILE_ALERT_CACHE_TTL_MS
        ) {
          setMissing(parsed.missing);
          setShow(parsed.missing.length > 0);
          return () => {
            isMounted = false;
            controller.abort();
          };
        }
      }
    } catch {}

    const loadStatus = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) return;
        const data = await res.json();
        const fields = Array.isArray(data?.incompleteFields)
          ? data.incompleteFields
          : [];

        if (isMounted) {
          setMissing(fields);
          setShow(fields.length > 0);
          try {
            sessionStorage.setItem(
              PROFILE_ALERT_CACHE_KEY,
              JSON.stringify({
                missing: fields,
                updatedAt: Date.now(),
              }),
            );
          } catch {}
        }
      } catch {
        if (isMounted) setShow(false);
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pathname, shouldCheckProfile]);

  if (!show) return null;
  return <ProfileAlertClient missing={missing} />;
}
