import "./admin.css";
import React from "react";
import { cookies } from "next/headers";
import { AdminSidebar } from "../components/admin/sidebar";
import { AdminHeader } from "../components/admin/header";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "../context/sidebar-context";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

async function getAdminData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return {
      _id: decoded.id,
      name: decoded.name || "Admin",
      email: decoded.email || "",
      isSuperAdmin: Boolean(decoded.isSuperAdmin),
      role: decoded.isSuperAdmin
        ? { name: "Super Admin", pages: ["*"] }
        : {
            name: decoded.roleName || "Admin",
            pages: decoded.rolePages || [],
          },
    };
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-muted/30 flex items-center justify-center">{children}</div>;
  }

  const admin = await getAdminData();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <AdminSidebar admin={admin} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader admin={admin} />
          
          <div
            className="flex-1 overflow-y-auto bg-muted/20 scrollbar-hide"
            role="region"
            aria-label="Admin content"
          >
            <div className="p-4 md:p-8 max-w-400 mx-auto">
              {children}
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
