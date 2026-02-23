"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function approveTransaction(id: string) {
  await serverApiFetch<{ success?: boolean; error?: string }>(
    `/api/admin/transactions/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: { action: "approve" },
      authCookie: "admin_token",
    },
  );

  revalidatePath("/admin/wallets");
}
