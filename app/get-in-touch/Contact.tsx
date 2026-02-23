"use client";

import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { submitContactForm } from "@/app/actions/contact";

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (formData: FormData) => {
    const name = formData.get("name");
    const email = formData.get("email");
    if (!name || !email) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const result = await submitContactForm(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Submitted successfully!");
      formRef.current?.reset();
    } else {
      toast.error(`${result.message}`);
    }
  };

  return (
    <div className="mx-auto p-6 c-form-box flex flex-col gap-2 items-center justify-center max-w-full min-w-full">
      <form
        ref={formRef}
        action={handleAction}
        className="space-y-4 w-full contact-form"
      >
        <div className="w-full">
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-full border p-2 rounded-[10px] input"
          />
        </div>

        <div className="w-full">
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-full border p-2 rounded-[10px] input"
          />
        </div>

        <div className="w-full">
          <Input
            type="text"
            name="topic"
            placeholder="Subject"
            required
            className="w-full border p-2 rounded-[10px] input"
          />
        </div>

        <div className="w-full">
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={5}
            className="w-full border p-2 rounded-[10px] resize-none border-input bg-transparent px-3 py-2 text-base shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-[10px] hover:opacity-90 transition-all font-bold"
        >
          {loading ? "Sending..." : "Contact Now"}
        </button>
      </form>

      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen bg-black/30">
          <Loader line="Sending..." />
        </div>
      )}
    </div>
  );
};

export default Contact;
