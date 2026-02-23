"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestBaseUrl, serverApiFetch } from "@/lib/server-api";

const AUTH_COOKIE_NAME = "auth_token";

async function applyAuthCookieFromResponse(response: Response) {
  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) return;

  const match = setCookieHeader.match(/auth_token=([^;]+)/);
  if (!match?.[1]) return;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, match[1], {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function validateSession() {
  const response = await serverApiFetch<{ user: any | null }>("/api/auth/me", {
    method: "GET",
    authCookie: "auth_token",
  });

  if (!response.success || !response.data?.user) {
    return { authenticated: false };
  }

  const user = response.data.user;
  if (user.status === "Blocked") {
    return { authenticated: false };
  }

  return { authenticated: true, userId: user._id?.toString() };
}

export async function checkLoginStatusAction(requestId: string) {
  const response = await serverApiFetch<{
    approved?: boolean;
    blocked?: boolean;
    tempToken?: string;
    status?: "expired" | "blocked" | "pending" | "approved";
  }>("/api/auth/check-login-request", {
    method: "POST",
    body: { requestId },
  });

  if (!response.success || !response.data) {
    return { approved: false, blocked: false, status: "expired" };
  }

  if (response.data.status === "expired") {
    return { approved: false, blocked: false, status: "expired" };
  }

  if (response.data.blocked || response.data.status === "blocked") {
    return { approved: false, blocked: true, status: "blocked" };
  }

  if (response.data.approved || response.data.status === "approved") {
    return {
      approved: true,
      blocked: false,
      tempToken: response.data.tempToken,
      status: "approved",
    };
  }

  return { approved: false, blocked: false, status: "pending" };
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  const errors = { email: "", password: "", general: "", attempts: 0 };

  if (!email) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  if (errors.email || errors.password) return { errors };

  const baseUrl = await getRequestBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data: any = await response.json().catch(() => ({}));
  const message = data?.message || "Login failed";

  if (response.ok && data?.success) {
    await applyAuthCookieFromResponse(response);
    return { success: true, redirect: "/profile" };
  }

  if (data?.requireEmailConfirm) {
    return { requireEmailConfirm: true, requestId: String(data.requestId) };
  }

  if (response.status === 403 && /blocked/i.test(message)) {
    return { blocked: true, message };
  }

  const attemptMatch = message.match(/(\d+)\/8/);
  const attempts = attemptMatch ? Number(attemptMatch[1]) : 0;

  if (
    /payment/i.test(message) ||
    /review/i.test(message) ||
    /wait/i.test(message)
  ) {
    return { errors: { ...errors, general: message, attempts } };
  }

  return {
    errors: {
      ...errors,
      password: message,
      attempts,
    },
  };
}

export async function verifyOtpAction(
  otp: string,
  tempToken: string,
  requestId?: string,
) {
  const baseUrl = await getRequestBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ otp, tempToken, requestId }),
    cache: "no-store",
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    return { error: data?.message || "Invalid OTP code. Please try again." };
  }

  await applyAuthCookieFromResponse(response);
  return { success: true, redirect: "/profile" };
}

export async function forgotPasswordAction(email: string) {
  const response = await serverApiFetch<{ message?: string }>(
    "/api/auth/forgot-password",
    {
      method: "POST",
      body: { email },
    },
  );

  if (!response.success) {
    return { error: response.data?.message || response.error || "Failed to send OTP" };
  }

  return { success: true };
}

export async function resetPasswordAction(data: any) {
  const response = await serverApiFetch<{ message?: string }>(
    "/api/auth/reset-password",
    {
      method: "POST",
      body: data,
    },
  );

  if (!response.success) {
    return { error: response.data?.message || response.error || "Password reset failed" };
  }

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
