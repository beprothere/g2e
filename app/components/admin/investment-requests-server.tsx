import { InvestmentRequestsClient } from "./investment-requests-client";
import { serverApiFetch } from "@/lib/server-api";

export default async function InvestmentRequestsServer({
  searchParams,
}: {
  searchParams: any;
}) {
  const sParams = await searchParams;
  const page = Number(sParams?.page || 1);

  const response = await serverApiFetch<{
    success: boolean;
    data: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/admin/investment-requests?page=${page}`, {
    method: "GET",
    authCookie: "admin_token",
    next: { revalidate: 20, tags: ["admin-investments", "admin-investment-requests"] },
  });

  if (!response.success || !response.data?.success) {
    return (
      <InvestmentRequestsClient
        initialData={[]}
        pagination={{ page, total: 0, totalPages: 0 }}
      />
    );
  }

  return (
    <InvestmentRequestsClient
      initialData={response.data.data || []}
      pagination={response.data.pagination}
    />
  );
}
