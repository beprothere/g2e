"use server";
 
import { serverApiFetch } from "@/lib/server-api";

export async function startSignupAction(formData: FormData) {
  try {
    const fullName = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const referBy = formData.get("referral") as string;
    const deviceFingerprint = formData.get("deviceFingerprint") as string;

    const response = await serverApiFetch<{ success?: boolean; email?: string; message?: string }>(
      "/api/auth/signup/start",
      {
        method: "POST",
        body: { fullName, email, password, referBy, deviceFingerprint },
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        message: response.data?.message || response.error || "Something went wrong on server",
      };
    }

    return { success: true, email: response.data.email || email };
  } catch (e) {
    return { success: false, message: "Something went wrong on server" };
  }
}

export async function completeSignupAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const transactionId = formData.get("transactionId") as string;
    const receiptBase64 = formData.get("receiptBase64") as string;

    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/auth/signup/complete",
      {
        method: "POST",
        body: {
          email,
          otp,
          paymentMethod,
          transactionId,
          receiptBase64,
        },
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        message: response.data?.message || response.error || "Failed to complete signup",
      };
    }

    return { success: true };
  } catch (e) {
    return { success: false, message: "Failed to complete signup" };
  }
}
