"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loan, Payment, Bill, BillPayment } from "@/lib/types";
import { formatPHP } from "@/lib/dates";
import {
  computeHealthScore,
  HealthScore,
  ScoreBreakdown,
} from "@/lib/health-score";

interface HealthScoreViewProps {
  loans: Loan[];
  payments: Payment[];
  bills: Bill[];
  billPayments: BillPayment[];
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold sm:text-4xl ${color}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownRow({ item }: { item: ScoreBreakdown }) {
  const percentage = item.maxPoints > 0 ? (item.points / item.maxPoints) * 100 : 0;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{item.label}</span>
        <span className="text-sm text-muted-foreground">
          {item.points}/{item.maxPoints}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 80
              ? "bg-green-500"
              : percentage >= 50
                ? "bg-amber-500"
                : "bg-destructive"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{item.detail}</p>
    </div>
  );
}

export function HealthScoreView({
  loans,
  payments,
  bills,
  billPayments,
}: HealthScoreViewProps) {
  const [result, setResult] = useState<HealthScore | null>(null);

  useEffect(() => {
    setResult(computeHealthScore(loans, payments, bills, billPayments));
  }, [loans, payments, bills, billPayments]);

  if (!result) return null;

  const activeLoans = loans.filter((l) => l.status === "active");
  const totalMonthly =
    activeLoans.reduce((s, l) => s + l.monthlyPayment, 0) +
    bills.filter((b) => b.status === "active").reduce((s, b) => s + b.typicalAmount, 0);
  const totalDebt = activeLoans.reduce((s, l) => s + l.remainingBalance, 0);

  const monthsToDebtFree =
    activeLoans.length > 0
      ? Math.ceil(
          totalDebt /
            Math.max(1, activeLoans.reduce((s, l) => s + l.monthlyPayment, 0))
        )
      : 0;

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + monthsToDebtFree);
  const debtFreeDateStr = debtFreeDate.toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="grid gap-4">
      {/* Score card */}
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          <p className="mb-1 text-sm text-muted-foreground">
            Payment Health Score
          </p>
          <ScoreRing score={result.score} color={result.color} />
          <p className={`mt-2 text-lg font-semibold ${result.color}`}>
            {result.grade}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.score >= 85
              ? "You're managing your finances like a pro!"
              : result.score >= 70
                ? "Doing well — keep up the momentum"
                : result.score >= 50
                  ? "Room for improvement — pay overdue items first"
                  : "Take action now — focus on overdue payments"}
          </p>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monthly obligations
          </p>
          <p className="text-lg font-bold sm:text-xl">
            {formatPHP(totalMonthly)}
          </p>
        </div>
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Total debt
          </p>
          <p className="text-lg font-bold sm:text-xl">
            {formatPHP(totalDebt)}
          </p>
        </div>
        {activeLoans.length > 0 && (
          <div className="col-span-2 rounded-xl border p-3 sm:col-span-1 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Debt-free by
            </p>
            <p className="text-lg font-bold sm:text-xl">{debtFreeDateStr}</p>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <p className="text-sm font-semibold">Score Breakdown</p>
          {result.breakdown.map((item) => (
            <BreakdownRow key={item.label} item={item} />
          ))}
        </CardContent>
      </Card>

      {/* Tips */}
      {result.score < 85 && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-semibold">Tips to Improve</p>
            <div className="mt-2 grid gap-2">
              {result.breakdown
                .filter((b) => b.points < b.maxPoints)
                .sort((a, b) => a.points / a.maxPoints - b.points / b.maxPoints)
                .slice(0, 3)
                .map((b) => (
                  <p
                    key={b.label}
                    className="text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {b.label}:
                    </span>{" "}
                    {getTip(b.label)}
                  </p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getTip(label: string): string {
  switch (label) {
    case "Loan Payoff":
      return "Make extra payments when possible — even small amounts speed up payoff.";
    case "Bills This Month":
      return "Pay your remaining bills for this month to boost your score.";
    case "On-Time Status":
      return "Clear overdue items first — they hurt your score the most.";
    case "Payment Activity":
      return "Record your recent payments to keep your activity score up.";
    default:
      return "Stay on top of your payments to improve your score.";
  }
}
