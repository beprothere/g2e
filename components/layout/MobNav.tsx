"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, TrendingUp, Link2, Home, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const tabs = [
  { href: "/dashboard", label: "Apps", Icon: LayoutGrid },
  { href: "/investor-plans", label: "Stats", Icon: TrendingUp },
  { href: "/", label: "Home", Icon: Home },
  { href: "/team", label: "Team", Icon: Users },
  { href: "/referral", label: "Invite", Icon: Link2 },
];

const MobNav = () => {
  const pathname = usePathname() || "";
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    const index = tabs.findIndex((t) => {
      if (t.href === "/") return pathname === "/" || pathname === "";
      return pathname.startsWith(t.href);
    });
    if (index >= 0) setActiveIndex(index);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/login")) return null;
  if (pathname.startsWith("/signup")) return null;
  if (pathname.startsWith("/account-created")) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-999 h-18 bg-transparent pointer-events-none">
      <div className="relative w-full h-full max-w-md mx-auto pointer-events-auto">
        
        <div className="absolute inset-0 z-0">
          <svg
            width="100%"
            height="75"
            viewBox="0 0 400 75"
            preserveAspectRatio="none"
            className="fill-white drop-shadow-[0_-5px_15px_rgba(0,0,0,0.08)]"
          >
            <motion.path
              animate={{
                d: `M 0 20 
                    L ${activeIndex * 80 + 5} 20 
                    Q ${activeIndex * 80 + 15} 20 ${activeIndex * 80 + 20} 30 
                    A 25 25 0 0 0 ${activeIndex * 80 + 60} 30 
                    Q ${activeIndex * 80 + 65} 20 ${activeIndex * 80 + 75} 20 
                    L 400 20 L 400 75 L 0 75 Z`
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </svg>
        </div>

        <motion.div
          className="absolute -top-4 w-[20%] flex justify-center z-20 pointer-events-none"
          animate={{ x: `${activeIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 mt-1 border-4 border-white">
            {tabs[activeIndex] && (() => {
              const Icon = tabs[activeIndex].Icon;
              return <Icon size={22} strokeWidth={2.5} />;
            })()}
          </div>
        </motion.div>

        <div className="relative z-10 flex w-full h-25 mt-0">
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            const Icon = tab.Icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center relative"
                onClick={() => setActiveIndex(index)}
              >
                <motion.div
                  animate={{ 
                    y: isActive ? -45 : 0, 
                    opacity: isActive ? 0 : 1,
                    scale: isActive ? 0.5 : 1 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-6 h-6 text-gray-400" />
                </motion.div>

                <motion.span
                  className="absolute top-13 text-[10px] font-bold text-blue-600"
                  animate={{ 
                    opacity: isActive ? 1 : 0, 
                    y: isActive ? 0 : 15 
                  }}
                >
                  {tab.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobNav;