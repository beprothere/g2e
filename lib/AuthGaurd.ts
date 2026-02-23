"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGaurd({ children }: any) {
  const router = useRouter();
  useEffect(() => {
    const chckUser = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.replace("/login");
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data?.user) {
        localStorage.clear();
        router.replace("/login");
      }
    };

    chckUser();
  }, []);

  return children;
}
