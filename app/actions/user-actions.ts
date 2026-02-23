"use server";

import { sendPush } from "@/lib/notifier";
import { revalidatePath } from "next/cache";

export async function updateUserAction(
  userId: string,
  formData: any,
  oldUser: any,
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin-panel/platform-users/${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );

    if (!res.ok) throw new Error("Failed to update user");
    if (formData.status !== oldUser.status) {
      sendPush(
        userId,
        "Account Status Updated",
        `Your account status has been changed to ${formData.status} by the admin.`,
        "/profile",
      ).catch((e) => console.error(e));
    }

    if (Number(formData.depositBalance) > Number(oldUser.depositBalance)) {
      const amountAdded =
        Number(formData.depositBalance) - Number(oldUser.depositBalance);
      sendPush(
        userId,
        "Deposit Confirmed",
        `$${amountAdded} has been added to your deposit balance by the admin.`,
        "/wallet",
      ).catch((e) => console.error(e));
    }

    if (
      formData.fullName !== oldUser.fullName ||
      formData.email !== oldUser.email
    ) {
      sendPush(
        userId,
        "Profile Updated",
        "Your profile information has been updated by the admin.",
        "/profile",
      ).catch((e) => console.error(e));
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
