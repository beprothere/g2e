import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold pro-head">Profile Settings</h1>
            <p className="text-foreground/70 pro-desc">
              Manage your account information and preferences
            </p>
          </div>
          <Button variant="outline" disabled>
            Edit Profile
          </Button>
        </div>

        <Card className="glass border-primary/20 p-8 card-profile">
          <h3 className="text-lg font-bold mb-6">Personal Information</h3>
          <div className="flex justify-center mb-6">
            <Skeleton className="w-28 h-28 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass border-primary/20 p-8 card-profile">
          <h3 className="text-lg font-bold mb-6">Shipping Address</h3>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>

        <Card className="glass border-primary/20 p-8 card-profile">
          <h3 className="text-lg font-bold mb-6">Account Settings</h3>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
