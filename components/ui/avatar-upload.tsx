"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  value?: string;
  onChange: (base64: string) => void;
};

export function AvatarUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string); // ✅ base64
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div className="h-20 w-20 rounded-full border overflow-hidden bg-muted flex items-center justify-center">
        {value ? (
          <img
            src={value}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No Avatar</span>
        )}
      </div>

      {/* Upload */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Upload Avatar
        </Button>
      </div>
    </div>
  );
}
