"use client"
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PWA_ENABLED_PREFIXES = [
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
const PWA_USER_ID_CACHE_KEY = "pwa-user-id-cache";

export default function PWAHandler({ userId }: { userId?: string }) {
  const [resolvedUserId, setResolvedUserId] = useState(userId || "");
  const pathname = usePathname() || "";
  const shouldEnablePWA = PWA_ENABLED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    if (!pathname.startsWith("/admin")) return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      )
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("g2e-cache-"))
              .map((key) => caches.delete(key)),
          ),
        )
        .catch(() => {});
    }
  }, [pathname]);

  useEffect(() => {
    if (!shouldEnablePWA) return;
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => {});

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {});
      }

      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch((err) => console.error("Service worker register failed:", err));
  }, [pathname, shouldEnablePWA]);

  useEffect(() => {
    if (!shouldEnablePWA) return;
    if (userId) {
      setResolvedUserId(userId);
      try {
        sessionStorage.setItem(PWA_USER_ID_CACHE_KEY, userId);
      } catch {}
      return;
    }

    if (resolvedUserId) {
      return;
    }

    let isMounted = true;

    try {
      const cached = sessionStorage.getItem(PWA_USER_ID_CACHE_KEY);
      if (cached) {
        setResolvedUserId(cached);
        return () => {
          isMounted = false;
        };
      }
    } catch {}

    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const id = data?.user?._id;
        if (isMounted && typeof id === "string") {
          setResolvedUserId(id);
          try {
            sessionStorage.setItem(PWA_USER_ID_CACHE_KEY, id);
          } catch {}
        }
      } catch {}
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [shouldEnablePWA, userId, resolvedUserId]);

  useEffect(() => {
    if (!shouldEnablePWA) return;
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator && resolvedUserId) {
      const promptedKey = `push-permission-prompted:${resolvedUserId}`;
      if (sessionStorage.getItem(promptedKey)) return;

      const registerAndSubscribe = async () => {
        try {
          const registration = await navigator.serviceWorker.ready;

          const permission = await Notification.requestPermission();
          sessionStorage.setItem(promptedKey, "1");

          if (permission === "granted") {
            let sub = await registration.pushManager.getSubscription();
            
            if (!sub) {
              const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
              sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey,
              });
            }

            await fetch("/api/notifications/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: resolvedUserId, subscription: sub }),
            });
            
            console.log("Push Subscription Successful!");
          }
        } catch (err) {
          console.error("PWA Subscription Error:", err);
        }
      };

      registerAndSubscribe();
    }
  }, [pathname, resolvedUserId, shouldEnablePWA]);

  return null;
}
