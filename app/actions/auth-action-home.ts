"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function checkAuthStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}