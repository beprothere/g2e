"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileAlertClient({ missing }: { missing: string[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  if (!isOpen || missing.length === 0) return null;

  return (
    <div className="fixed top-15 left-0 z-999 p-4">
      <div className="max-w-lg min-w-80 bg-white text-gray-700 p-4 rounded-md shadow-lg border border-gray-200 flex flex-col items-center gap-3">
        <Info className="text-yellow-400" size={64} />
        <p className="text-lg font-semibold uppercase">Update your profile</p>

        <div className="w-full text-sm flex flex-col items-center">
          <b className="block mb-1 text-center">Missing Profile Fields:</b>
          <ul className="list-decimal text-center list-inside space-y-1 capitalize flex items-center justify-center mt-4 gap-2 flex-wrap w-3/4">
            {missing.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="bg-gray-200 hover:bg-red-500 text-black hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            className="bg-green-700 text-white hover:bg-primary"
            onClick={() => router.push("/profile")}
          >
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
