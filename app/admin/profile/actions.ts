"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

async function adminFetch(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
) {
  const response = await serverApiFetch<any>(endpoint, {
    method,
    body,
    authCookie: "admin_token",
    cache: "no-store",
  });

  if (!response.success) {
    console.error(`API Error on ${endpoint}:`, response.error);
    return { success: false, error: response.error };
  }

  return { success: true, data: response.data };
}

export async function updateProfileAction(data: any) {
  const res = await adminFetch("/api/admin/profile", "PUT", data);
  if (res.success) revalidatePath("/admin/profile");
  return res;
}

export async function createRoleAction(name: string) {
  const res = await adminFetch("/api/admin/roles", "POST", { name, pages: [] });
  if (res.success) revalidatePath("/admin/profile");
  return res;
}

export async function createAdminAction(data: any) {
  const res = await adminFetch("/api/admin/users", "POST", data);
  if (res.success) revalidatePath("/admin/profile");
  return res;
}

export async function updateAdminUserAction(id: string, data: any) {
  const res = await adminFetch(`/api/admin/users/${id}`, "PUT", data);
  if (res.success) revalidatePath("/admin/profile");
  return res;
}

export async function deleteAdminAction(id: string) {
  const res = await adminFetch(`/api/admin/users/${id}`, "DELETE");
  if (res.success) revalidatePath("/admin/profile");
  return res;
}

export async function assignRoleAction(data: any) {
  const res = await adminFetch("/api/admin/assign-role", "POST", data);
  if (res.success) revalidatePath("/admin/profile");
  return res;
}
