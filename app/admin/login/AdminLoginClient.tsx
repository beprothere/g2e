"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_email");
    const savedPassword = localStorage.getItem("admin_pass");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("admin_email", email);
        localStorage.setItem("admin_pass", password);
      } else {
        localStorage.removeItem("admin_email");
        localStorage.removeItem("admin_pass");
      }

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid Credentials");

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#05070a] overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-105 md:max-w-115 lg:max-w-135 px-2">
        <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-4xl px-6 py-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-t-white/20">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 mb-4 shadow-inner">
              <ShieldCheck className="text-blue-400 w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Access your admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-[13px] py-2 px-4 rounded-lg text-center animate-bounce">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-all" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all autofill-custom"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-all" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="........"
                  className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all autofill-custom"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-400 cursor-pointer select-none hover:text-gray-200 transition-colors"
              >
                Stay logged in
              </label>
            </div>

            <button
              disabled={loading}
              className="relative w-full overflow-hidden group bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Sign In to Dashboard"
                )}
              </div>
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-30deg] -translate-x-full group-hover:animate-shine" />
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .autofill-custom:-webkit-autofill,
        .autofill-custom:-webkit-autofill:hover,
        .autofill-custom:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #111827 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .group-hover\\:animate-shine {
          animation: shine 0.7s ease-in-out;
        }
      `}</style>
    </div>
  );
}
