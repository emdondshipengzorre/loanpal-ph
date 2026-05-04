"use client";

import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loan, Bill, BillPayment, Payment } from "@/lib/types";
import { fetchLoans, fetchBills, fetchBillPaymentsForPeriod, fetchAllPayments, fetchAllBillPayments } from "@/lib/storage";
import { formatPHP, getCurrentPeriod, ordinalSuffix } from "@/lib/dates";
import { computeAlerts, fireNotifications, AlertItem } from "@/lib/alerts";
import { useNotifications } from "@/lib/use-notifications";
import { AddLoanDialog } from "./add-loan-dialog";
import { AddBillDialog } from "./add-bill-dialog";
import { LoanCard } from "./loan-card";
import { BillCard } from "./bill-card";
import { PayDayPlanner } from "./pay-day-planner";
import { AlertBanner } from "./alert-banner";
import { NotificationBell } from "./notification-bell";
import { HealthScoreView } from "./health-score-view";
import { AuthButton } from "./auth-button";
import { BatchScanDialog } from "./batch-scan-dialog";
import { FinancialOverview } from "./financial-overview";

type Tab = "loans" | "bills" | "planner" | "health" | "overview";

export function Dashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allBillPayments, setAllBillPayments] = useState<BillPayment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("loans");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const { enabled: notificationsEnabled } = useNotifications();

  const refresh = useCallback(async () => {
    const [loanData, billData, periodPayments, loanPayments, billPaymentsAll] =
      await Promise.all([
        fetchLoans(),
        fetchBills(),
        fetchBillPaymentsForPeriod(getCurrentPeriod()),
        fetchAllPayments(),
        fetchAllBillPayments(),
      ]);
    setLoans(loanData);
    setBills(billData);
    setBillPayments(periodPayments);
    setAllPayments(loanPayments);
    setAllBillPayments(billPaymentsAll);
  }, []);

  useEffect(() => {
    refresh().then(() => setMounted(true));
  }, [refresh]);

  useEffect(() => {
    if (!mounted) return;
    const alertItems = computeAlerts(loans, bills, billPayments);
    setAlerts(alertItems);
    if (notificationsEnabled && alertItems.length > 0) {
      fireNotifications(alertItems);
    }
  }, [mounted, loans, bills, billPayments, notificationsEnabled]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      refresh();
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mounted, refresh]);

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

  const activeBills = bills.filter((b) => b.status === "active");
  const totalMonthlyBills = activeBills.reduce(
    (sum, b) => sum + b.typicalAmount,
    0
  );
  const paidBillIds = new Set(billPayments.map((p) => p.billId));

  const nextDueBill = activeBills
    .filter((b) => !paidBillIds.has(b.id))
    .sort((a, b) => {
      const now = new Date();
      const dayOfMonth = now.getDate();
      const aDist = a.dueDay >= dayOfMonth ? a.dueDay - dayOfMonth : a.dueDay + 31 - dayOfMonth;
      const bDist = b.dueDay >= dayOfMonth ? b.dueDay - dayOfMonth : b.dueDay + 31 - dayOfMonth;
      return aDist - bDist;
    })[0];

  if (loans.length === 0 && bills.length === 0) {
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
            Manage your loans and bills in one place
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Track HomeCredit, Tala, Meralco, PLDT and more — never
            miss a payment.
          </p>

          <div className="mt-8 flex gap-3">
            <AddLoanDialog
              onLoanAdded={refresh}
              triggerLabel="Add a loan"
              triggerSize="default"
            />
            <AddBillDialog
              onBillAdded={refresh}
              triggerLabel="Add a bill"
              triggerSize="default"
            />
          </div>

          <p className="mt-12 text-xs text-muted-foreground/60">
            Made for Filipinos, by Filipinos
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
          {activeTab === "loans" && (
            <>
              <BatchScanDialog onImported={refresh} />
              <AddLoanDialog onLoanAdded={refresh} triggerSize="sm" />
            </>
          )}
          {activeTab === "bills" && (
            <AddBillDialog onBillAdded={refresh} triggerSize="sm" />
          )}
          <NotificationBell alerts={alerts} />
          <AuthButton />
        </div>
      </div>

      <Separator className="my-4 sm:my-6" />

      <AlertBanner alerts={alerts} />

      {/* Tab switcher */}
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1 sm:mb-6">
        {(
          [
            { key: "overview", label: "Overview" },
            { key: "loans", label: "Loans" },
            { key: "bills", label: "Bills" },
            { key: "planner", label: "Planner" },
            { key: "health", label: "Health" },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Stats grid */}
      {activeTab === "loans" && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
            <p className="text-sm text-muted-foreground">Active loans</p>
            <p className="text-xl font-bold sm:text-2xl">
              {activeLoans.length}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
            <p className="text-sm text-muted-foreground">Remaining balance</p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatPHP(totalRemaining)}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
            <p className="text-sm text-muted-foreground">Monthly payment</p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatPHP(totalMonthly)}
            </p>
          </div>
        </div>
      )}

      {activeTab === "bills" && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
            <p className="text-sm text-muted-foreground">Active bills</p>
            <p className="text-xl font-bold sm:text-2xl">
              {activeBills.length}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
            <p className="text-sm text-muted-foreground">Monthly expenses</p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatPHP(totalMonthlyBills)}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3 sm:block sm:p-4">
            <p className="text-sm text-muted-foreground">Next due</p>
            <p className="text-xl font-bold sm:text-2xl">
              {nextDueBill
                ? `${nextDueBill.provider === "Other" ? nextDueBill.customProviderName : nextDueBill.provider} (${ordinalSuffix(nextDueBill.dueDay)})`
                : "All paid!"}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "loans" && (
        loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No loans added yet.</p>
            <AddLoanDialog
              onLoanAdded={refresh}
              triggerLabel="Add your first loan"
              triggerClassName="mt-4"
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onUpdate={refresh} />
            ))}
          </div>
        )
      )}

      {activeTab === "bills" && (
        bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No bills added yet.</p>
            <AddBillDialog
              onBillAdded={refresh}
              triggerLabel="Add your first bill"
              triggerClassName="mt-4"
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {bills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                isPaidThisMonth={paidBillIds.has(bill.id)}
                onUpdate={refresh}
              />
            ))}
          </div>
        )
      )}

      {activeTab === "planner" && (
        <PayDayPlanner
          loans={loans}
          bills={bills}
          billPayments={billPayments}
        />
      )}

      {activeTab === "health" && (
        <HealthScoreView
          loans={loans}
          payments={allPayments}
          bills={bills}
          billPayments={allBillPayments}
        />
      )}

      {activeTab === "overview" && (
        <FinancialOverview loans={loans} bills={bills} />
      )}
    </div>
  );
}
