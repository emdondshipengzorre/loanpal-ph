import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — LoanPal PH",
  description: "Sign in to sync your loans and bills across devices",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
