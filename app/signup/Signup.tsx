"use client";

import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Copy, QrCode, CheckCircle2 } from "lucide-react";
import Loader from "@/components/Loader";
import { startSignupAction, completeSignupAction } from "@/app/actions/auth";
import Image from "next/image";
import { getActiveWallets } from "../actions/wallets";

const PAYMENT_DETAILS = {
  JazzCash: {
    id: "0301-XXXXXXX",
    name: "Mohammad Ahmed",
    color: "bg-[#f5a623]",
    qrImage: "/img/ex.png",
  },
  EasyPaisa: {
    id: "0312-XXXXXXX",
    name: "Ahmed Raza",
    color: "bg-[#1fb47e]",
    qrImage: "/img/ex.png",
  },
};

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const [referBy, setReferBy] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [paymentMethod, setPaymentMethod] = useState<"JazzCash" | "EasyPaisa">(
    "JazzCash",
  );
  const currentMethod = PAYMENT_DETAILS[paymentMethod];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Number copied!");
  };

  const copyTotilClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Till ID copied!");
  };

  const [transactionId, setTransactionId] = useState("");
  const [receiptBase64, setReceiptBase64] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [fetchingWallets, setFetchingWallets] = useState(true);

  useEffect(() => {
    if (step === 2 && wallets.length === 0) {
      const loadWallets = async () => {
        setFetchingWallets(true);
        try {
          const data = await getActiveWallets();
          setWallets(data);
          if (data.length > 0) setSelectedWallet(data[0]);
        } catch (err) {
          toast.error("Failed to load payment methods");
        } finally {
          setFetchingWallets(false);
        }
      };
      loadWallets();
    }
  }, [step]);

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "jazzcash":
        return "bg-[#f5a623]";
      case "easypaisa":
        return "bg-[#1fb47e]";
      case "bank":
        return "bg-[#003d7a]";
      default:
        return "bg-gray-600";
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferBy(ref);
  }, []);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const startSignup = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const form = e.target;
    const newErrors: Record<string, string> = {};

    if (!form.fullname.value) newErrors.fullname = "Full name is required";
    if (!form.email.value) newErrors.email = "Email is required";
    if (!isPasswordValid)
      newErrors.password = "Password does not meet requirements";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      toast.error("Please fix the errors below");
      return;
    }

    const getFingerprint = () => {
      if (typeof window === "undefined") return "server";

      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
      const renderer =
        gl && debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : "no-webgl";

      return `${navigator.userAgent}-${renderer}-${window.screen.width}x${window.screen.height}`;
    };

    const formData = new FormData();
    formData.append("fullname", form.fullname.value);
    formData.append("email", form.email.value);
    formData.append("password", password);
    formData.append("referral", referBy || form.referral.value);
    formData.append("deviceFingerprint", getFingerprint());

    try {
      const result = await startSignupAction(formData);
      setLoading(false);

      if (!result.success) {
        toast.error(result.message || "Error");
        return;
      }

      setSignupEmail(result.email!);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch {
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  const handleReceiptUpload = (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const completeSignup = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!otp) newErrors.otp = "OTP is required";
    if (!receiptBase64) newErrors.receipt = "Receipt image required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      toast.error("Please complete all required fields");
      return;
    }

    setLoading2(true);

    const formData = new FormData();
    formData.append("email", signupEmail);
    formData.append("otp", otp.trim());
    formData.append("paymentMethod", paymentMethod);
    formData.append("transactionId", transactionId);
    formData.append("receiptBase64", receiptBase64);

    try {
      const result = await completeSignupAction(formData);
      setLoading2(false);

      if (!result.success) {
        toast.error(result.message || "Error");
        return;
      }

      toast.success("Signup completed successfully");
      window.location.href = "/account-created";
    } catch {
      setLoading2(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="py-20 md:py-32">
        <div className="max-w-md mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-foreground/70">
              Join Glow2Earn and start earning today
            </p>
          </div>

          {step === 1 && (
            <Card className="glass border-primary/20 p-8 sign-up-card">
              <form className="space-y-5" onSubmit={startSignup}>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    name="fullname"
                    placeholder="John Doe"
                    className="input"
                  />
                  {errors.fullname && (
                    <p className="text-xs text-red-500">{errors.fullname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={(e) => setPassFocus(true)}
                      onBlur={(e) => setPassFocus(false)}
                      className="pr-10 input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {passFocus ? (
                    <div className="mt-2 space-y-1 text-xs">
                      {[
                        ["At least 8 characters", passwordRules.length],
                        ["One uppercase letter", passwordRules.uppercase],
                        ["One lowercase letter", passwordRules.lowercase],
                        ["One number", passwordRules.number],
                        ["One special character", passwordRules.special],
                      ].map(([label, ok]) => (
                        <p
                          key={label + "ok"}
                          className={`flex gap-2 ${
                            ok ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {ok ? "✔" : "✖"} {label}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400">
                      Please write a strong password with <b>8 characters</b>
                    </p>
                  )}

                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Referral Code (Optional)</Label>
                  <Input
                    name="referral"
                    className="input"
                    placeholder="Enter referral code if you have one"
                    defaultValue={referBy}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input id="terms" type="checkbox" required className="mt-1" />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="#" className="text-primary">
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link href="#" className="text-primary">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button disabled={loading} className="w-full">
                  {loading ? "Sending OTP..." : "Next"}
                </Button>
              </form>
            </Card>
          )}

          {loading && (
            <div className="fixed top-0 left-0 w-full h-screen z-999 bg-black/30 flex flex-col items-center justify-center">
              <Loader
                line={
                  "Sending OTP to your email, Please check your email Inbox/spam folder..."
                }
              />
            </div>
          )}

          {step === 2 && (
            <Card className="glass border-primary/20 p-6 md:p-8 space-y-6 sign-up-card">
              <div className="space-y-2">
                <Label>Email Verification</Label>
                <Input
                  value={otp}
                  type="number"
                  className="no-spinner input text-center text-lg tracking-widest font-bold"
                  placeholder="0 0 0 0 0 0"
                  onChange={(e) => setOtp(e.target.value)}
                />
                {errors.otp && (
                  <p className="text-xs text-red-500">{errors.otp}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-bold text-foreground">
                  Select Payment Method
                </Label>

                {fetchingWallets ? (
                  <div className="flex justify-center py-4">
                    <Loader line="Loading Wallets..." />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {wallets.map((wallet) => (
                        <div
                          key={wallet._id}
                          onClick={() => setSelectedWallet(wallet)}
                          className={`relative flex flex-row-reverse gap-2 items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedWallet?._id === wallet?._id
                              ? "border-primary bg-primary/5 shadow-md scale-105"
                              : "border-gray-200 bg-white/50 hover:border-gray-300"
                          }`}
                        >
                          {selectedWallet?._id === wallet._id && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                          <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">
                            {wallet?.provider}
                          </span>
                        </div>
                      ))}
                    </div>

                    {selectedWallet && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-2xl">
                        <div
                          className={`${getProviderColor(selectedWallet?.provider)} p-3 text-white text-center`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black italic">
                            Payment Detail ({selectedWallet?.provider})
                          </p>
                        </div>

                        <div className="p-5 flex flex-col items-center space-y-4">
                          <div className="relative group">
                            <div className="p-2 bg-white rounded-xl border-2 border-dashed border-gray-200 group-hover:border-primary/50 transition-colors">
                              <Image
                                src={selectedWallet?.qrPic}
                                alt="QR"
                                width={140}
                                height={140}
                                className="rounded-lg object-contain"
                              />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-bold">
                              SCAN TO PAY
                            </div>
                          </div>

                          <div
                            className={`w-full space-y-2 ${getProviderColor(selectedWallet.provider)} text-white p-4 rounded-xl`}
                          >
                            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                              <span className="text-[10px] uppercase font-bold">
                                Holder Name
                              </span>
                              <span className="text-xs font-black uppercase">
                                {selectedWallet.holderName}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[10px] uppercase font-bold block leading-none mb-1">
                                  Account / Till ID
                                </span>
                                <span className="text-base font-mono font-black tracking-tighter">
                                  0{selectedWallet.walletNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    `0${selectedWallet.walletNumber.toString()}`,
                                  )
                                }
                                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all active:scale-90"
                              >
                                <Copy size={16} />
                              </button>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[10px] uppercase font-bold block leading-none mb-1">
                                  IBAN Number
                                </span>
                                <span className="text-base font-mono font-black tracking-tighter">
                                  {selectedWallet.walletTilId}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyTotilClipboard(
                                    selectedWallet.walletTilId.toString(),
                                  )
                                }
                                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all active:scale-90"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`${getProviderColor(selectedWallet?.provider)} p-3 text-white text-center`}
                        >
                          <span className="text-[14px] uppercase text-center flex flex-col gap-0.5 items-center justify-center tracking-[0.2em] font-black">
                            <p>Pay Now PKR</p>
                            <p>{selectedWallet?.signupBalance}</p>
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="text-muted-foreground text-[10px]">
                <q>
                  You need to pay{" "}
                  <b className="text-primary/50 text-[12px]">
                    RS:{selectedWallet?.signupBalance}
                  </b>
                </q>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Transaction ID (Optional)</Label>
                  <Input
                    value={transactionId}
                    placeholder="TID1234567"
                    className="input"
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 w-full max-w-md">
                <Label className="text-sm font-semibold text-gray-700">
                  Upload Payment Receipt
                </Label>

                <div className="relative">
                  {!receiptPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group"
                    >
                      <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      </div>

                      <div className="mt-3 text-center px-4">
                        <p className="text-sm font-medium text-gray-600">
                          Click to capture or upload receipt
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group bg-gray-100">
                      <img
                        src={receiptPreview}
                        className="w-full h-64 object-contain mx-auto"
                        alt="Receipt Preview"
                      />

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemove}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReceiptUpload(file);
                    }}
                  />
                </div>

                {errors.receipt && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                    <span>⚠️</span> {errors.receipt}
                  </p>
                )}
              </div>

              <Button disabled={loading2} onClick={completeSignup}>
                {loading2 ? "Creating Account..." : "Complete Signup"}
              </Button>
            </Card>
          )}

          {loading2 && (
            <div className="fixed top-0 left-0 w-full h-screen z-999 bg-black/30 flex flex-col items-center justify-center">
              <Loader
                line={
                  "Creating Account, Please check your email for further confirmation..."
                }
              />
            </div>
          )}

          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold">
              Sign in
            </Link>
          </p>

          <Card className="glass border-accent/20 bg-accent/5 p-6">
            <p className="text-sm text-center">
              <b>Note:</b> $20 deposit is required to activate your account.
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
