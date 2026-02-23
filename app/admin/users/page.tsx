import { UsersFilters } from "@/app/components/admin/users-filters";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all platform users
        </p>
      </div>

      <UsersFilters />
    </div>
  );
}