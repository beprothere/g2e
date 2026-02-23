import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Team from "./Team";

const TeamPage = () => {
  return (
    <DashboardLayout>
      <div className="p-0 flex flex-col gap-4">
        <h1 className="text-xl font-bold">Your Team Members</h1>
        <Team />
      </div>
    </DashboardLayout>
  );
};

export default TeamPage;
