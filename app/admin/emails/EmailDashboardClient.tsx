"use client";

import React, { useActionState } from "react";
import { handleEmailAction, FormState } from "@/app/actions/emailActions";

const initialState: FormState = {
  message: "",
  status: "idle",
};

export default function EmailDashboardClient() {
  const [state, formAction, isPending] = useActionState(
    handleEmailAction,
    initialState,
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10 font-sans text-[#2c3e50]">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Email Marketing Dashboard
            </h1>
            <p className="text-sm text-gray-500">Sending via support@glow2earn.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-6">Create Campaign</h2>

            <form action={formAction} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  To
                </label>
                <input
                  name="to"
                  type="email"
                  placeholder="client@example.com"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Offer for you!"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Gmail Category
                </label>
                <select
                  name="category"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="primary">Primary (Direct Inbox)</option>
                  <option value="promotions">Promotions (Marketing Tab)</option>
                  <option value="updates">Updates (System Alerts)</option>
                  <option value="social">Social (Community Updates)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  HTML Message
                </label>
                <textarea
                  name="message"
                  placeholder="Hello from Glow2Earn..."
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg ${
                  isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200"
                }`}
              >
                {isPending ? "Connecting SMTP..." : "Send Email"}
              </button>

              {state.message && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium text-center ${
                    state.status === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {state.message}
                </div>
              )}
            </form>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100">
              <h3 className="font-bold text-lg mb-2">Pro Tip for 110% Accuracy</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Gmail algorithms are smart. If you select <b>Promotions</b>, make sure
                to add at least 2 links and 1 image link in your message. For{" "}
                <b>Primary</b>, keep the message simple like a personal chat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Configuration</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">SMTP Host</span>
                  <span className="font-mono text-xs">smtp.hostinger.com</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Port</span>
                  <span className="font-mono text-xs">465 (Secure)</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">From</span>
                  <span className="font-mono text-xs">support@glow2earn.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
