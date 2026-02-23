import { getProfileDataAction } from "@/app/actions/profile-actions";
import ProfileClient from "./ProfileClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const { user } = await getProfileDataAction();
  if (!user) redirect("/login");

  return (
    <DashboardLayout>
      <ProfileClient initialUser={user} />
    </DashboardLayout>
  );
}