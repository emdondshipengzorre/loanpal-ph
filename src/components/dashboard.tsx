"use client";

import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Loan } from "@/lib/types";
import { getLoans } from "@/lib/loans";
import { AddLoanDialog } from "./add-loan-dialog";
import { LoanCard } from "./loan-card";

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

  const refresh = useCallback(() => {
    setLoans(getLoans());
  }, []);

  useEffect(() => {
    refresh();
    setMounted(true);
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
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <span className="text-2xl font-bold text-primary-foreground">
              L
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">LoanPal PH</h1>

          <p className="mt-3 text-lg text-muted-foreground">
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
            triggerClassName="mt-8"
          />

          <p className="mt-12 text-xs text-muted-foreground/60">
            Built for Filipinos, by Filipinos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">L</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">LoanPal PH</h1>
        </div>
        <AddLoanDialog onLoanAdded={refresh} triggerSize="sm" />
      </div>

      <Separator className="my-6" />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Active loans</p>
          <p className="text-2xl font-bold">{activeLoans.length}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total remaining</p>
          <p className="text-2xl font-bold">{formatPHP(totalRemaining)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Monthly payments</p>
          <p className="text-2xl font-bold">{formatPHP(totalMonthly)}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} onUpdate={refresh} />
        ))}
      </div>
    </div>
  );
}
