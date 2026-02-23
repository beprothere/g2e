import { redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApiFetch } from "@/lib/server-api";

export const dynamic = "force-dynamic";

function ProfilePageFallback() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Role & Permissions</h3>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </Card>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Admin Users</h3>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}

async function ProfileDataSection() {
  const [adminResponse, rolesResponse, usersResponse] = await Promise.all([
    serverApiFetch<any>("/api/admin/me", {
      method: "GET",
      authCookie: "admin_token",
    }),
    serverApiFetch<any[]>("/api/admin/roles", {
      method: "GET",
      authCookie: "admin_token",
    }),
    serverApiFetch<{ success?: boolean; users?: any[] }>("/api/admin/users", {
      method: "GET",
      authCookie: "admin_token",
    }),
  ]);

  if (!adminResponse.success || !adminResponse.data) {
    redirect("/admin/login");
  }

  const roles = rolesResponse.success ? rolesResponse.data || [] : [];
  const adminUsers =
    usersResponse.success && usersResponse.data?.success
      ? usersResponse.data.users || []
      : [];

  return (
    <ProfileClient
      initialAdmin={adminResponse.data}
      initialRoles={roles}
      initialUsers={adminUsers}
    />
  );
}

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage account settings, roles, and admin permissions
        </p>
      </div>

      <Suspense fallback={<ProfilePageFallback />}>
        <ProfileDataSection />
      </Suspense>
    </div>
  );
}
