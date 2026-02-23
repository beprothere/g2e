"use server";

import { serverApiFetch } from "@/lib/server-api";

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const topic = formData.get("topic") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !topic || !message) {
      return { success: false, message: "All fields are required" };
    }

    const response = await serverApiFetch<{ success?: boolean; message?: string }>(
      "/api/contact",
      {
        method: "POST",
        body: { name, email, topic, message },
      },
    );

    if (!response.success || !response.data?.success) {
      return {
        success: false,
        message: response.data?.message || response.error || "Server error",
      };
    }

    return { success: true };
  } catch {
    return { success: false, message: "Server error" };
  }
}
