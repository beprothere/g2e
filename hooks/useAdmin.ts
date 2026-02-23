"use client";

import { useEffect, useState } from "react";

export function useAdmin() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  return { admin, loading };
}
