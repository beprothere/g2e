"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginConfirmed() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("otpToken");
    if (token) {
      setTimeout(() => {
        router.push(`/login?otpToken=${token}`);
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold text-green-600">
        ✅ Access granted
      </h1>
    </div>
  );
}
