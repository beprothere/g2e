"use client";

import type React from "react";
import { Footer } from "./footer";
import { Sidebar } from "./Sidebar";
import Chat from "../Chat";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden bg-background">
      <aside className="hidden md:flex h-screen border-r">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div
          className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full"
          role="region"
          aria-label="Dashboard content"
        >
          {children}
        </div>

        <Footer />
        <Chat />
      </div>
    </div>
  );
}
