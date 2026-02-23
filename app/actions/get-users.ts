import { serverApiFetch } from "@/lib/server-api";

export async function getUsers(searchParams: any) {
  try {
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || 10;

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (searchParams?.search) query.set("search", String(searchParams.search));
    if (searchParams?.status) query.set("status", String(searchParams.status));
    if (searchParams?.plan) query.set("plan", String(searchParams.plan));
    if (searchParams?.dateRange) query.set("dateRange", String(searchParams.dateRange));

    const response = await serverApiFetch<{
      users: any[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/api/admin-panel/platform-users?${query.toString()}`, {
      method: "GET",
      authCookie: "admin_token",
    });

    if (!response.success || !response.data) {
      return { users: [], total: 0, page: 1, totalPages: 0 };
    }

    return {
      users: response.data.users || [],
      total: response.data.total || 0,
      page: response.data.page || page,
      totalPages: response.data.totalPages || 0,
    };
  } catch (err) {
    console.error("GET USERS ACTION ERROR:", err);
    return { users: [], total: 0, page: 1, totalPages: 0 };
  }
}
