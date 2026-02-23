import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <DashboardLayout>
      <div className="p-0 flex flex-col gap-4">
        <h1 className="text-xl font-bold">Your Team Members</h1>

        <div className="space-y-6">
          <div className="flex flex-col justify-between sm:flex-row gap-4">
            <div className="relative w-full sm:w-85 search">
              <Skeleton className="h-11 w-full" />
            </div>

            <div className="flex items-center flex-col sm:flex-row justify-center gap-4">
              <Skeleton className="h-11 w-full sm:w-40" />
              <Skeleton className="h-11 w-full sm:w-40" />
            </div>
          </div>

          <Card className="p-4">
            <div className="overflow-x-auto rounded-sm border">
              <table className="w-full text-sm team-tabel">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-6" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-36" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-12 mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-16 mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-20 mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-3 w-14 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
