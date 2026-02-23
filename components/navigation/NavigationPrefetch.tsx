"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function NavigationPrefetch() {
  const router = useRouter();
  const pathname = usePathname() || "";

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (pathname.startsWith("/admin")) return;

    const prefetched = new Set<string>();

    const prefetchFromTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      const anchor = element?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (href.startsWith("/admin")) return;
      if (prefetched.has(href)) return;

      prefetched.add(href);
      router.prefetch(href);
    };

    const onMouseOver = (event: Event) => prefetchFromTarget(event.target);
    const onTouchStart = (event: Event) => prefetchFromTarget(event.target);

    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, [pathname, router]);

  return null;
}
