import TransactionLedgerClient from "./transaction-ledger.client";
import { serverApiFetch } from "@/lib/server-api";

export default async function TransactionLedgerServer({
  searchParams,
}: {
  searchParams?: { page?: string; type?: string };
}) {
  const page = Number(searchParams?.page) || 1;
  const type = searchParams?.type || "all";

  const query = new URLSearchParams({
    page: String(page),
    limit: "5",
  });

  if (type !== "all") {
    query.set("type", type);
  }

  const response = await serverApiFetch<{
    data: any[];
    total: number;
  }>(`/api/admin/transactions?${query.toString()}`, {
    method: "GET",
    authCookie: "admin_token",
  });

  return (
    <TransactionLedgerClient
      initialTransactions={response.success ? response.data?.data || [] : []}
      total={response.success ? response.data?.total || 0 : 0}
      currentPage={page}
      currentFilter={type}
    />
  );
}
