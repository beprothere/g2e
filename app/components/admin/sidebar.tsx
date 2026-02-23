"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import logo from "@/app/favicon.ico";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Share2,
  TrendingUp,
  Wallet,
  DollarSign,
  LogOut,
  Gift,
  Package,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ADMIN_PAGES } from "@/lib/admin-pages";
import Image from "next/image";

const ICONS: Record<string, any> = {
  dashboard: LayoutDashboard,
  rewards: Gift,
  users: Users,
  serum: Package,
  referrals: Share2,
  investments: TrendingUp,
  wallets: Wallet,
  deposits: DollarSign,
  withdrawals: LogOut,
  security: Lock,
};

export function AdminSidebar({ admin }: { admin: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [logoHover, setLogoHover] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const router = useRouter();
  const prefetchedPathsRef = useRef<Set<string>>(new Set());

  const prefetchPath = useCallback(
    (path: string) => {
      if (process.env.NODE_ENV !== "production") return;
      if (prefetchedPathsRef.current.has(path)) return;
      prefetchedPathsRef.current.add(path);
      router.prefetch(path);
    },
    [router],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const visiblePages = admin?.isSuperAdmin
    ? ADMIN_PAGES
    : ADMIN_PAGES.filter((p) => admin?.role?.pages?.includes(p.key));

  const isActive = (item: any) => {
    if (item.path === "/admin") return pathname === "/admin";
    return pathname === item.path || pathname.startsWith(item.path + "/");
  };

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Image src={logo} alt="logo-fav-admin" width={40} height={40} />
            </div>
            <span className="font-bold">Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-muted"
            type="button"
            aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              id="admin-mobile-menu"
              className="fixed flex flex-col gap-10 justify-between left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border z-50 overflow-y-auto"
            >
              <nav className="px-3 py-4 space-y-1">
                {visiblePages.map((item: any) => {
                  const Icon = ICONS[item.key];
                  return (
                    <Link
                      key={item.key}
                      href={item.path}
                      prefetch={false}
                      onMouseEnter={() => prefetchPath(item.path)}
                      onFocus={() => prefetchPath(item.path)}
                      onTouchStart={() => prefetchPath(item.path)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm transition",
                        isActive(item)
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="px-4 py-3 border-t flex items-center justify-between">
                <Link href="/admin/profile" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    <div className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-sm uppercase">
                      {admin?.role?.name.substring(0, 2)}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">{admin?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {admin.isSuperAdmin ? "Super Admin" : admin.role?.name}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setOpenLogout(true)}
                  className="flex items-end justify-center w-fit"
                >
                  <LogOut className="h-4 w-4 text-xl! mr-2 rotate-180" />
                </button>
              </div>
            </aside>
          </>
        )}

        <AlertDialog open={openLogout} onOpenChange={setOpenLogout}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your active session will be terminated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleLogout}
              >
                Confirm Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-full flex flex-col transition-[width] duration-300 ease-in-out",
        open ? "w-72" : "w-16",
      )}
    >
      <div className="relative flex items-center justify-between px-3 py-2.5 h-[64.5px] border-b">
        <div
          className="relative flex items-center gap-2"
          onMouseEnter={() => !open && setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          <div
            className={cn(
              "h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold transition-opacity duration-200",
              !open && logoHover ? "opacity-0" : "opacity-100",
            )}
          >
            <Image src={logo} alt="logo-fav-admin" width={40} height={40} />
          </div>
          <div>
            {open && <div className="font-bold">{admin?.name}</div>}
            {open && admin && (
              <div className="text-xs text-muted-foreground">
                {admin.isSuperAdmin ? "Super Admin" : admin.role?.name}
              </div>
            )}
          </div>
          {!open && logoHover && (
            <button
              onClick={() => setOpen(true)}
              className="absolute left-0 h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted"
              type="button"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-muted"
            type="button"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {visiblePages.map((item: any) => {
          const Icon = ICONS[item.key];
          const active = isActive(item);
          return (
            <Link
              key={item.key}
              href={item.path}
              prefetch={false}
              title={!open ? item.label : undefined}
              aria-label={!open ? item.label : undefined}
              onMouseEnter={() => prefetchPath(item.path)}
              onFocus={() => prefetchPath(item.path)}
              onTouchStart={() => prefetchPath(item.path)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                !open && "justify-center",
              )}
            >
              <Icon className="h-5 w-5" />
              {open && <span>{item.label}</span>}
              {open && active && (
                <div className="ml-auto w-1.5 h-6 bg-accent-foreground rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
