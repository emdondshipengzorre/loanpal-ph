"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OtpInput } from "./otp-input";
import {
  signInWithGoogle,
  signInWithFacebook,
  signUpWithEmail,
  signInWithEmail,
  signInWithMagicLink,
  signInWithPhone,
  verifyPhoneOtp,
  verifyEmailOtp,
  resetPassword,
  getUser,
} from "@/lib/storage";
import Link from "next/link";

type AuthView =
  | "main"
  | "phone-otp"
  | "email-verify"
  | "magic-link-sent"
  | "forgot-password"
  | "reset-sent";

function mapError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("User already registered")) return "An account with this email already exists. Try signing in.";
  if (msg.includes("Email not confirmed")) return "Please verify your email first.";
  if (msg.includes("otp_expired") || msg.includes("Token has expired")) return "Code expired. Please request a new one.";
  if (msg.includes("rate") || msg.includes("limit")) return "Too many requests. Please wait a few minutes.";
  if (msg.includes("Password should be at least")) return "Password must be at least 8 characters.";
  return msg;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<AuthView>("main");
  const [emailMode, setEmailMode] = useState<"password" | "magic-link">("password");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (emailMode === "magic-link") {
      setLoading(true);
      const { error } = await signInWithMagicLink(email);
      setLoading(false);
      if (error) {
        setError(mapError(error.message));
      } else {
        setView("magic-link-sent");
      }
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      const { error, data } = await signUpWithEmail(email, password);
      setLoading(false);
      if (error) {
        setError(mapError(error.message));
      } else if (data.user && !data.session) {
        setView("email-verify");
        setResendCooldown(60);
      } else {
        router.push("/");
      }
    } else {
      setLoading(true);
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        setError(mapError(error.message));
      } else {
        router.push("/");
      }
    }
  }

  async function handleEmailVerify(code: string) {
    clearMessages();
    setLoading(true);
    const { error } = await verifyEmailOtp(email, code);
    setLoading(false);
    if (error) {
      setError(mapError(error.message));
      setOtp("");
    } else {
      router.push("/");
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(mapError(error.message));
    } else {
      setView("reset-sent");
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
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">L</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">LoanPal PH</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to sync your loans & bills
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

      {/* Email OTP verification (after sign-up) */}
      {view === "email-verify" && (
        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="text-center">
              <p className="text-sm font-medium">Verify your email</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={handleEmailVerify}
              disabled={loading}
            />
            <Button
              onClick={() => handleEmailVerify(otp)}
              disabled={loading || otp.length < 6}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <button
              type="button"
              className="text-center text-xs text-muted-foreground underline"
              onClick={() => { setView("main"); setOtp(""); clearMessages(); }}
            >
              Back
            </button>
          </CardContent>
        </Card>
      )}

      {/* Magic link sent */}
      {view === "magic-link-sent" && (
        <Card>
          <CardContent className="grid gap-4 p-6 text-center">
            <p className="text-sm font-medium">Check your email</p>
            <p className="text-xs text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>. Click the link
              in the email to sign in.
            </p>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => { setView("main"); clearMessages(); }}
            >
              Back to sign in
            </button>
          </CardContent>
        </Card>
      )}

      {/* Forgot password */}
      {view === "forgot-password" && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleForgotPassword} className="grid gap-4">
              <p className="text-sm font-medium">Reset your password</p>
              <div className="grid gap-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
              <button
                type="button"
                className="text-center text-xs text-muted-foreground underline"
                onClick={() => { setView("main"); clearMessages(); }}
              >
                Back to sign in
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Password reset sent */}
      {view === "reset-sent" && (
        <Card>
          <CardContent className="grid gap-4 p-6 text-center">
            <p className="text-sm font-medium">Check your email</p>
            <p className="text-xs text-muted-foreground">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => { setView("main"); clearMessages(); }}
            >
              Back to sign in
            </button>
          </CardContent>
        </Card>
      )}

      {/* Main view */}
      {view === "main" && (
        <div className="grid gap-4">
          {/* Social logins */}
          <div className="grid gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleFacebook}
              disabled={loading}
            >
              Continue with Facebook
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Phone OTP */}
          <Card>
            <CardContent className="grid gap-3 p-4">
              <Label htmlFor="phone" className="text-xs font-medium">
                Phone number
              </Label>
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

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email section */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex gap-1 rounded-md bg-muted p-0.5">
                <button
                  type="button"
                  className={`flex-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                    emailMode === "password"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => { setEmailMode("password"); clearMessages(); }}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                    emailMode === "magic-link"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => { setEmailMode("magic-link"); clearMessages(); }}
                >
                  Magic Link
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {emailMode === "password" && (
                  <>
                    <div className="grid gap-1.5">
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                        minLength={8}
                      />
                    </div>

                    {isSignUp && (
                      <div className="grid gap-1.5">
                        <Label htmlFor="confirm" className="text-xs">Confirm password</Label>
                        <Input
                          id="confirm"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                          minLength={8}
                        />
                      </div>
                    )}

                    <Button type="submit" size="sm" disabled={loading}>
                      {loading
                        ? "Loading..."
                        : isSignUp
                          ? "Create account"
                          : "Sign in"}
                    </Button>

                    <div className="flex justify-between text-xs">
                      <button
                        type="button"
                        className="text-muted-foreground underline"
                        onClick={() => { setIsSignUp(!isSignUp); clearMessages(); }}
                      >
                        {isSignUp
                          ? "Already have an account? Sign in"
                          : "Don't have an account? Sign up"}
                      </button>
                      {!isSignUp && (
                        <button
                          type="button"
                          className="text-muted-foreground underline"
                          onClick={() => { setView("forgot-password"); clearMessages(); }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                  </>
                )}

                {emailMode === "magic-link" && (
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? "Sending..." : "Send magic link"}
                  </Button>
                )}
              </form>
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
        </div>
      )}
    </div>
  );
}
