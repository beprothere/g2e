"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/server-api";

export async function getProfileDataAction() {
  const response = await serverApiFetch<{ user: any | null }>("/api/auth/me", {
    method: "GET",
    authCookie: "auth_token",
  });

  if (!response.success || !response.data?.user) {
    return { user: null };
  }

  return { user: response.data.user };
}

export async function updateProfileAction(formData: any) {
  const response = await serverApiFetch<{
    success?: boolean;
    profileStatus?: boolean;
    message?: string;
  }>("/api/profile/update", {
    method: "PUT",
    body: formData,
    authCookie: "auth_token",
  });

  if (!response.success || !response.data?.success) {
    return {
      success: false,
      message: response.data?.message || response.error || "Failed to update profile",
    };
  }

  revalidatePath("/profile");
  return {
    success: true,
    profileStatus: Boolean(response.data.profileStatus),
  };
}

export async function toggleAccountStatusAction() {
  const response = await serverApiFetch<{ status?: string; message?: string }>(
    "/api/account/deactivate",
    {
      method: "POST",
      authCookie: "auth_token",
    },
  );

  if (!response.success || !response.data?.status) {
    return { success: false, message: response.data?.message || response.error };
  }

  revalidatePath("/profile");
  return { success: true, status: response.data.status };
}

export async function deleteAccountAction() {
  const response = await serverApiFetch<{ message?: string }>("/api/account/delete", {
    method: "DELETE",
    authCookie: "auth_token",
  });

  if (!response.success) {
    return { success: false, message: response.data?.message || response.error };
  }

  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  return { success: true };
}

export async function changePasswordAction({
  currentPassword,
  newPassword,
}: any) {
  const response = await serverApiFetch<{ message?: string }>(
    "/api/account/change-password",
    {
      method: "POST",
      body: { currentPassword, newPassword },
      authCookie: "auth_token",
    },
  );

  if (!response.success) {
    return {
      success: false,
      message: response.data?.message || response.error || "Failed to change password",
    };
  }

  return { success: true };
}

export async function setup2FAAction() {
  const response = await serverApiFetch<{ qrCode?: string; manualKey?: string; message?: string }>(
    "/api/2fa/setup",
    {
      method: "POST",
      authCookie: "auth_token",
    },
  );

  if (!response.success || !response.data?.qrCode || !response.data?.manualKey) {
    return { success: false, message: response.data?.message || response.error };
  }

  return {
    success: true,
    qrCode: response.data.qrCode,
    manualKey: response.data.manualKey,
  };
}

export async function verify2FAAction(otp: string) {
  const response = await serverApiFetch<{ message?: string }>("/api/2fa/verify", {
    method: "POST",
    body: { otp },
    authCookie: "auth_token",
  });

  if (!response.success) {
    return {
      success: false,
      message: response.data?.message || response.error || "Invalid OTP",
    };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function disable2FAAction({ currentPassword, otp }: any) {
  const response = await serverApiFetch<{ message?: string }>("/api/2fa/disable", {
    method: "POST",
    body: { currentPassword, otp },
    authCookie: "auth_token",
  });

  if (!response.success) {
    return {
      success: false,
      message: response.data?.message || response.error || "Failed to disable 2FA",
    };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function updateEmailPrefsAction(prefs: any) {
  const response = await serverApiFetch<{ message?: string }>(
    "/api/account/email-preferences",
    {
      method: "PUT",
      body: prefs,
      authCookie: "auth_token",
    },
  );

  if (!response.success) {
    return { success: false, message: response.data?.message || response.error };
  }

  return { success: true };
}
