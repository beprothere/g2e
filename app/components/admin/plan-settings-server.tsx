import { PlanSettingsClient } from "./plan-settings-client";
import { serverApiFetch } from "@/lib/server-api";

export default async function PlanSettingsServer() {
  const response = await serverApiFetch<{ success: boolean; plans: any[] }>(
    "/api/admin/plans",
    {
      method: "GET",
      authCookie: "admin_token",
      next: { revalidate: 60, tags: ["admin-investments", "admin-plans"] },
    },
  );

  const plans = response.success && response.data?.success ? response.data.plans || [] : [];
  return <PlanSettingsClient initialPlans={plans} />;
}
