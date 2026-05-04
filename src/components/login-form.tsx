"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OtpInput } from "./otp-input";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithPhone,
  verifyPhoneOtp,
  getUser,
} from "@/lib/storage";
import Link from "next/link";

type AuthView = "main" | "phone-otp";

function mapError(msg: string): string {
  if (msg.includes("otp_expired") || msg.includes("Token has expired")) return "Code expired. Please request a new one.";
  if (msg.includes("rate") || msg.includes("limit")) return "Too many requests. Please wait a few minutes.";
  return msg;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<AuthView>("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    getUser().then((user) => {
      if (user) router.push("/");
    });
  }, [router]);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError("Authentication failed. Please try again.");
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function clearMessages() {
    setError(null);
    setMessage(null);
  }

  async function handleGoogle() {
    clearMessages();
    const { error } = await signInWithGoogle();
    if (error) setError(mapError(error.message));
  }

  async function handleFacebook() {
    clearMessages();
    const { error } = await signInWithFacebook();
    if (error) setError(mapError(error.message));
  }

  async function handlePhoneSend() {
    clearMessages();
    if (phone.length !== 10 || !phone.startsWith("9")) {
      setError("Enter a valid 10-digit Philippine mobile number starting with 9.");
      return;
    }
    setLoading(true);
    const { error } = await signInWithPhone(`+63${phone}`);
    setLoading(false);
    if (error) {
      setError(mapError(error.message));
    } else {
      setView("phone-otp");
      setResendCooldown(60);
    }
  }

  async function handlePhoneVerify(code: string) {
    clearMessages();
    setLoading(true);
    const { error } = await verifyPhoneOtp(`+63${phone}`, code);
    setLoading(false);
    if (error) {
      setError(mapError(error.message));
      setOtp("");
    } else {
      router.push("/");
    }
  }

  async function handleResendPhoneOtp() {
    clearMessages();
    setLoading(true);
    const { error } = await signInWithPhone(`+63${phone}`);
    setLoading(false);
    if (error) {
      setError(mapError(error.message));
    } else {
      setResendCooldown(60);
      setMessage("New code sent.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary ring-4 ring-primary/20">
            <span className="text-3xl font-bold text-primary-foreground">L</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">LoanPal PH</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to sync your loans & bills
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            Track HomeCredit, Tala, Cashalo and more
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Phone OTP verification */}
        {view === "phone-otp" && (
          <Card>
            <CardContent className="grid gap-4 p-6">
              <div className="text-center">
                <p className="text-sm font-medium">Enter the 6-digit code</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sent to +63{phone}
                </p>
              </div>
              <OtpInput
                value={otp}
                onChange={setOtp}
                onComplete={handlePhoneVerify}
                disabled={loading}
              />
              <Button
                onClick={() => handlePhoneVerify(otp)}
                disabled={loading || otp.length < 6}
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="text-muted-foreground underline disabled:opacity-50"
                  onClick={handleResendPhoneOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
                <button
                  type="button"
                  className="text-muted-foreground underline"
                  onClick={() => { setView("main"); setOtp(""); clearMessages(); }}
                >
                  Back
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main view */}
        {view === "main" && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 font-medium"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center gap-2 bg-[#1877F2] font-medium text-white hover:bg-[#166FE5]"
                onClick={handleFacebook}
                disabled={loading}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Card className="ring-1 ring-primary/20">
              <CardContent className="grid gap-3 p-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="phone" className="text-xs font-medium">
                    Phone number
                  </Label>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Most popular
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    +63
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9171234567"
                    className="flex-1"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handlePhoneSend}
                  disabled={loading || phone.length < 10}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </CardContent>
            </Card>

            <div className="mt-2 text-center">
              <Link
                href="/"
                className="text-xs text-muted-foreground underline"
              >
                Or continue without an account
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground/50">
              Made for Filipinos, by Filipinos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
