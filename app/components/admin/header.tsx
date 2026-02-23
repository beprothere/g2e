"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  Settings,
  User,
  Loader2,
  Wallet,
  Package,
  TrendingUp,
  ChevronRight,
  X,
  CheckCheck,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getNotifications,
  updateNotificationStatus,
  archiveNotification,
  markAllAsRead,
  archiveAllNotifications,
} from "@/app/actions/notification";

const TYPE_ICONS: Record<string, any> = {
  user: User,
  wallet: Wallet,
  package: Package,
  trending: TrendingUp,
};

export function AdminHeader({ admin }: { admin: any }) {
  const [isDark, setIsDark] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [newNotifPopup, setNewNotifPopup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "archived">("inbox");

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const latestNotifIdRef = useRef<string | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const fetchNotifs = async () => {
    const data = await getNotifications();
    if (data.length > 0) {
      const latest = data[0];
      const isActuallyNew =
        latestNotifIdRef.current !== null &&
        latestNotifIdRef.current !== latest._id;

      if (isActuallyNew && latest.status === "No Read") {
        setNewNotifPopup(latest);
        setTimeout(() => setNewNotifPopup(null), 20000);
      }

      latestNotifIdRef.current = latest._id;
    }
    setNotifications(data);
    setNotifLoaded(true);
  };

  const loadNotifsOnce = () => {
    if (!notifLoaded) {
      fetchNotifs();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (notifLoaded && document.visibilityState === "visible") {
        fetchNotifs();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [notifLoaded]);

  const filteredNotifs = notifications.filter((n) =>
    activeTab === "inbox" ? n.isArchieved === false : n.isArchieved === true,
  );

  const unreadCount = notifications.filter(
    (n) => n.status === "No Read" && !n.isArchieved,
  ).length;

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.length > 1) {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/search?q=${search}`);
          const data = await res.json();
          setResults(data);
          setShowSearchDropdown(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setShowSearchDropdown(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const getNotificationLink = (item: any) => {
    const type = item.NotificationType || "";
    const userId = item.userId;

    if (
      type.includes("Deposit") ||
      type.includes("Plan Purchase") ||
      type.includes("Withdrawal") ||
      type.includes("Commission")
    ) {
      return `/admin/users/${userId}#transactions`;
    }

    if (type.includes("Serum Order") || type.includes("Confirmed")) {
      return `/admin/users/${userId}#serum-orders`;
    }

    return `/admin/users/${userId}`;
  };

  const handleNotifClick = async (notifId: string, link: string) => {
    await updateNotificationStatus(notifId);
    router.push(link);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-8 relative">
          <div
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4"
            ref={searchRef}
          >
            <div className="relative group">
              {loading ? (
                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
              ) : (
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              )}
              <Input
                placeholder="Search anything..."
                className="pl-10 h-10 bg-muted/50 rounded-full border-none focus-visible:ring-2 focus-visible:ring-primary/20 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length > 1 && setShowSearchDropdown(true)}
              />
            </div>

            {showSearchDropdown && (
              <div className="absolute top-full mt-3 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                <div className="p-2 max-h-96 overflow-y-auto">
                  {results.length > 0 ? (
                    results.map((item: any, idx) => {
                      const Icon = TYPE_ICONS[item.icon] || Search;
                      return (
                        <Link
                          key={idx}
                          href={item.link}
                          className="flex items-center gap-4 p-3 hover:bg-muted/80 rounded-lg group transition-all mb-1"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white shrink-0 transition-colors">
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.subTitle}
                            </p>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-muted-foreground"
                          />
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      No records matching "{search}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/5"
                  aria-label="Open notifications"
                  onClick={loadNotifsOnce}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold border-2 border-card">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-105 p-0 overflow-hidden shadow-2xl"
              >
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab("inbox")}
                      className={`text-[11px] font-black tracking-tighter ${activeTab === "inbox" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                    >
                      INBOX
                    </button>
                    <button
                      onClick={() => setActiveTab("archived")}
                      className={`text-[11px] font-black tracking-tighter ${activeTab === "archived" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                    >
                      ARCHIVED
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      await markAllAsRead();
                      fetchNotifs();
                    }}
                    className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <CheckCheck size={14} /> MARK ALL AS READ
                  </button>
                </div>

                <div className="max-h-100 overflow-y-auto">
                  {filteredNotifs.length > 0 ? (
                    filteredNotifs.map((item: any, idx) => {
                      const detailLink = getNotificationLink(item);
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-all group ${item.status === "No Read" ? "bg-primary/5" : ""}`}
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                            <Bell size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-bold truncate pr-4 uppercase">
                                {item.NotificationType}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.message}
                            </p>

                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold"
                                asChild
                                onClick={() =>
                                  updateNotificationStatus(item._id)
                                }
                              >
                                <Link href={`/admin/users/${item.userId}`}>
                                  VIEW PROFILE
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                                onClick={() =>
                                  handleNotifClick(item._id, detailLink)
                                }
                              >
                                VIEW DETAILS
                              </Button>
                            </div>
                          </div>
                          {!item.isArchieved && (
                            <button
                              onClick={async () => {
                                await archiveNotification(item._id);
                                fetchNotifs();
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                              type="button"
                              aria-label="Archive notification"
                              title="Archive notification"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                      No {activeTab} notifications
                    </div>
                  )}
                </div>

                <div className="p-2 border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    className="w-full h-9 text-[11px] font-bold text-muted-foreground hover:text-primary"
                    onClick={async () => {
                      await archiveAllNotifications();
                      fetchNotifs();
                    }}
                  >
                    ARCHIVE ALL NOTIFICATIONS
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-primary/5"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-2 pr-1 h-10 rounded-full hover:bg-transparent"
                  aria-label="Open account menu"
                >
                  <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary to-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {admin?.name?.substring(0, 2)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/emails"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" /> Email Marketing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => setOpenLogout(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* {newNotifPopup && (
        <div className="fixed bottom-6 right-6 z-100 w-80 bg-card border border-primary/20 shadow-2xl rounded-xl p-4 animate-in slide-in-from-right duration-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-primary uppercase">
              New Alert
            </span>
            <button
              onClick={() => setNewNotifPopup(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm font-medium">{newNotifPopup.message}</p>
          <Button
            size="sm"
            className="w-full mt-3 h-8"
            onClick={() =>
              handleNotifClick(
                newNotifPopup._id,
                getNotificationLink(newNotifPopup),
              )
            }
          >
            Check Now
          </Button>
        </div>
      )} */}

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
