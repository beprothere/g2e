"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ToastProvider = dynamic(() => import("@/components/ToastProvider"), {
  ssr: false,
});
const ProfileAlert = dynamic(() => import("@/components/profile/ProfileAlert"), {
  ssr: false,
});
const PWAHandler = dynamic(() => import("@/components/PWA/PWAHandler"), {
  ssr: false,
});
const NavigationPrefetch = dynamic(
  () => import("@/components/navigation/NavigationPrefetch"),
  { ssr: false },
);

export default function LayoutClientRuntime() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer loading of non-critical client components to after initial paint
    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      const timer = win.requestIdleCallback(() => {
        setMounted(true);
      }, { timeout: 2000 });
      return () => {
        if (typeof win.cancelIdleCallback === "function") {
          win.cancelIdleCallback(timer);
        }
      };
    }

    const fallbackTimer = window.setTimeout(() => {
      setMounted(true);
    }, 800);

    return () => window.clearTimeout(fallbackTimer);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <NavigationPrefetch />
      <PWAHandler />
      <ToastProvider />
      <ProfileAlert />
    </>
  );
}
