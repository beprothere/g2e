"use client";
import React, { useEffect, useState } from "react";

const UserName = () => {
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch("/api/plans/overview");
        const result = await response.json();
        const name = result?.data?.userData?.fullName || result?.userData?.fullName;
        if (name) setFullName(name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserName();
  }, []);

  if (loading) {
    return <div className="h-9 w-48 bg-muted animate-pulse rounded-md mb-2"></div>;
  }

  return (
    <h1 className="text-2xl lg:text-3xl md:text-2xl font-black tracking-tight uppercase">
      {fullName || "User"}
    </h1>
  );
};

export default UserName;