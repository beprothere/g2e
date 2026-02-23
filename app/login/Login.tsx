"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  loginAction,
  verifyOtpAction,
  forgotPasswordAction,
  resetPasswordAction,
  checkLoginStatusAction,
} from "@/app/actions/authActions";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  ShieldCheck,
  MailWarning,
} from "lucide-react";
import Loader from "@/components/Loader";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(loginAction, null);

  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stepLogin, setStepLogin] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [fpStep, setFpStep] = useState<1 | 2 | 3>(1);
  const [fpEmail, setFpEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!pendingRequestId) return;

    const interval = setInterval(async () => {
      const data = await checkLoginStatusAction(pendingRequestId);

      if (data.status === "blocked") {
        setBlocked(true);
        setPendingRequestId(null);
        clearInterval(interval);
      }

      if (data.status === "approved" && data.tempToken) {
        setTempToken(data.tempToken);
        setStepLogin(2);
        setPendingRequestId(null);
        clearInterval(interval);
        toast.success("Identity Verified!");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pendingRequestId]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Login successful!");
      router.replace(state.redirect || "/profile");
      router.refresh();
    }
    if (state?.blocked) setBlocked(true);
    if (state?.requireEmailConfirm) setPendingRequestId(state.requestId);
    if (state?.errors?.general) toast.error(state.errors.general);
    if (state?.errors?.attempts && state.errors.attempts >= 4) {
      toast(`Warning: ${state.errors.attempts}/8 attempts.`, { icon: "⚠️" });
    }
  }, [state, router]);

  const handleOtpVerify = async () => {
    setLoading(true);
    const res = await verifyOtpAction(otp, tempToken, state?.requestId);
    setLoading(false);
    if (res.error) toast.error(res.error);
    if (res.success) {
      router.push(res.redirect);
      router.refresh();
    }
  };

  const handleForgotStep2 = async () => {
    setLoading(true);
    const res = await forgotPasswordAction(fpEmail);
    setLoading(false);
    if (res.success) {
      setFpStep(3);
      toast.success("OTP Sent!");
    } else toast.error(`${res.error}`);
  };

  const handleResetFinal = async () => {
    setLoading(true);
    const res = await resetPasswordAction({
      email: fpEmail,
      otp,
      password: newPassword,
    });
    setLoading(false);
    if (res.success) {
      toast.success("Password Updated!");
      setShowForgot(false);
      setFpStep(1);
    } else toast.error(`${res.error}`);
  };

  if (state?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader line="Redirecting to your account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="grow py-20 md:py-32 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <Card className="p-8 shadow-xl border-t-4 border-t-primary relative overflow-hidden">
            {blocked ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in">
                <AlertTriangle className="text-red-600 mx-auto" size={54} />
                <h2 className="text-2xl font-bold text-red-600 uppercase tracking-tight">
                  Security Block
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed bg-red-50 p-3 rounded-lg border border-red-100">
                  Access denied for this IP. Contact{" "}
                  <strong>support@glow2earn.com</strong> to appeal.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {stepLogin === 1 && !pendingRequestId && (
                  <form action={formAction} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                      />
                      {state?.errors?.email && (
                        <p className="text-xs text-red-500">
                          {state.errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgot(true)}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {state?.errors?.password && (
                        <p className="text-xs text-red-500">
                          {state.errors.password}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full py-6 text-lg font-semibold"
                      disabled={isPending}
                    >
                      {isPending ? "Authenticating..." : "Sign In"}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/signup"
                        className="text-primary font-bold hover:underline"
                      >
                        Create Account
                      </Link>
                    </p>
                  </form>
                )}

                {pendingRequestId && (
                  <div className="text-center space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/20 space-y-4">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck
                          className="text-primary animate-pulse"
                          size={32}
                        />
                      </div>
                      <h3 className="font-bold text-lg">
                        Verify Your Identity
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent a secure link to your email. Please click
                        <span className="text-green-600 font-bold">
                          {" "}
                          "Yes, it's me"
                        </span>{" "}
                        to continue.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-center text-xs text-red-500 font-medium">
                      <MailWarning size={14} />
                      <span>
                        Unauthorized? Click "No" in email to block this IP.
                      </span>
                    </div>
                  </div>
                )}

                {stepLogin === 2 && (
                  <div className="space-y-5 animate-in zoom-in duration-300">
                    <h3 className="font-bold text-center text-xl">
                      2FA Verification
                    </h3>
                    <p className="text-xs text-center text-muted-foreground">
                      Enter the 6-digit code from your authenticator app.
                    </p>
                    <Input
                      type="number"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="text-center text-2xl tracking-[10px] py-6 focus:ring-primary"
                    />
                    <Button
                      onClick={handleOtpVerify}
                      disabled={loading}
                      className="w-full py-6 text-lg font-bold tracking-wide"
                    >
                      {loading ? "Verifying Code..." : "Grant Access"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => {
                        setStepLogin(1);
                        setPendingRequestId(null);
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 relative space-y-6">
            <button
              onClick={() => {
                setShowForgot(false);
                setFpStep(1);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Close forgot password dialog"
            >
              <X size={20} />
            </button>
            {fpStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Recover Account</h2>
                <p className="text-sm text-muted-foreground">
                  Confirm your email to receive a reset code.
                </p>
                <Button className="w-full" onClick={() => setFpStep(2)}>
                  Continue
                </Button>
              </div>
            )}
            {fpStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Email Address</h2>
                <Input
                  placeholder="example@xyz.com"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleForgotStep2}
                  disabled={loading}
                >
                  Send OTP
                </Button>
              </div>
            )}
            {fpStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Reset Password</h2>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>OTP Code</Label>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={
                          showNewPassword ? "Hide new password" : "Show new password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full py-6"
                  onClick={handleResetFinal}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Confirm New Password"}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {isPending && !state?.success && !pendingRequestId && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-100">
          <Loader line="Securely processing your request..." />
        </div>
      )}

      <Footer />
    </div>
  );
}
