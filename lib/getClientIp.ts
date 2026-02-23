import { headers } from "next/headers";

export async function getClientIp() {
  const h = await headers();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = h.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "127.0.0.1";
}
