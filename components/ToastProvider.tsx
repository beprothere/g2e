"use client";

import { Toaster, toast } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <div onClickCapture={() => toast.dismiss()}>
      <Toaster position="top-right" />
    </div>
  );
}
