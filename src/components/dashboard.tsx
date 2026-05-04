"use client";

import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Loan } from "@/lib/types";
import { fetchLoans } from "@/lib/storage";
import { AddLoanDialog } from "./add-loan-dialog";
import { LoanCard } from "./loan-card";
import { AuthButton } from "./auth-button";

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function Dashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(async () => {
    const data = await fetchLoans();
    setLoans(data);
  }, []);

  useEffect(() => {
    refresh().then(() => setMounted(true));
  }, [refresh]);

  if (!mounted) return null;

  const activeLoans = loans.filter((l) => l.status === "active");
  const totalRemaining = activeLoans.reduce(
    (sum, l) => sum + l.remainingBalance,
    0
  );
  const totalMonthly = activeLoans.reduce(
    (sum, l) => sum + l.monthlyPayment,
    0
  );

  if (loans.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="absolute right-4 top-4">
          <AuthButton />
        </div>
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <span className="text-3xl font-bold text-primary-foreground">
              L
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            LoanPal PH
          </h1>

          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Manage all your loans in one place
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Track HomeCredit, Tala, Cashalo, Atome, GLoan and more — never miss
            a payment again.
          </p>

          <AddLoanDialog
            onLoanAdded={refresh}
            triggerLabel="Add your first loan"
            triggerSize="lg"
            triggerClassName="mt-8 h-12 px-6 text-base"
          />

          <p className="mt-12 text-xs text-muted-foreground/60">
            Built for Filipinos, by Filipinos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-9 sm:w-9 sm:rounded-xl">
            <span className="text-base font-bold text-primary-foreground sm:text-lg">
              L
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            LoanPal PH
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AddLoanDialog onLoanAdded={refresh} triggerSize="sm" />
          <AuthButton />
        </div>
      </div>

      <Separator className="my-4 sm:my-6" />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
        <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
          <p className="text-sm text-muted-foreground">Active loans</p>
          <p className="text-xl font-bold sm:text-2xl">{activeLoans.length}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
          <p className="text-sm text-muted-foreground">Total remaining</p>
          <p className="text-xl font-bold sm:text-2xl">
            {formatPHP(totalRemaining)}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
          <p className="text-sm text-muted-foreground">Monthly payments</p>
          <p className="text-xl font-bold sm:text-2xl">
            {formatPHP(totalMonthly)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} onUpdate={refresh} />
        ))}
      </div>
    </div>
  );
}
