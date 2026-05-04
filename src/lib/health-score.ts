import { Loan, Payment, Bill, BillPayment } from "./types";
import { getDaysUntilDate, getDaysUntilDue } from "./dates";

export interface ScoreBreakdown {
  label: string;
  points: number;
  maxPoints: number;
  detail: string;
}

export interface HealthScore {
  score: number;
  grade: "Excellent" | "Good" | "Fair" | "Needs Work" | "Critical";
  color: string;
  breakdown: ScoreBreakdown[];
}

export function computeHealthScore(
  loans: Loan[],
  payments: Payment[],
  bills: Bill[],
  billPayments: BillPayment[]
): HealthScore {
  const breakdown: ScoreBreakdown[] = [];

  // --- 1. Loan Payoff Progress (0-25 points) ---
  const activeLoans = loans.filter((l) => l.status === "active");
  const paidLoans = loans.filter((l) => l.status === "paid");
  const totalBorrowed = loans.reduce((s, l) => s + l.amountBorrowed, 0);
  const totalRemaining = activeLoans.reduce((s, l) => s + l.remainingBalance, 0);

  let payoffPoints = 0;
  if (loans.length === 0) {
    payoffPoints = 25;
  } else if (totalBorrowed > 0) {
    const paidOffRatio = 1 - totalRemaining / totalBorrowed;
    payoffPoints = Math.round(paidOffRatio * 25);
  }
  breakdown.push({
    label: "Loan Payoff",
    points: payoffPoints,
    maxPoints: 25,
    detail:
      loans.length === 0
        ? "No loans — full marks!"
        : paidLoans.length > 0
          ? `${paidLoans.length} loan${paidLoans.length !== 1 ? "s" : ""} fully paid off`
          : `${Math.round(((totalBorrowed - totalRemaining) / totalBorrowed) * 100)}% of total debt paid`,
  });

  // --- 2. Bills Paid This Month (0-25 points) ---
  const activeBills = bills.filter((b) => b.status === "active");
  const currentPeriod = getCurrentPeriod();
  const paidBillIds = new Set(
    billPayments.filter((p) => p.period === currentPeriod).map((p) => p.billId)
  );
  const billsPaidCount = activeBills.filter((b) => paidBillIds.has(b.id)).length;

  let billsPoints = 0;
  if (activeBills.length === 0) {
    billsPoints = 25;
  } else {
    billsPoints = Math.round((billsPaidCount / activeBills.length) * 25);
  }
  breakdown.push({
    label: "Bills This Month",
    points: billsPoints,
    maxPoints: 25,
    detail:
      activeBills.length === 0
        ? "No active bills"
        : `${billsPaidCount}/${activeBills.length} bills paid`,
  });

  // --- 3. No Overdue Items (0-25 points) ---
  const overdueLoanCount = activeLoans.filter(
    (l) => getDaysUntilDate(l.nextDueDate) < 0
  ).length;
  const overdueBillCount = activeBills.filter(
    (b) => !paidBillIds.has(b.id) && getDaysUntilDue(b.dueDay) < 0
  ).length;
  const totalOverdue = overdueLoanCount + overdueBillCount;
  const totalActive = activeLoans.length + activeBills.length;

  let overduePoints = 25;
  if (totalActive > 0 && totalOverdue > 0) {
    const overdueRatio = totalOverdue / totalActive;
    overduePoints = Math.max(0, Math.round(25 * (1 - overdueRatio * 2)));
  }
  breakdown.push({
    label: "On-Time Status",
    points: overduePoints,
    maxPoints: 25,
    detail:
      totalOverdue === 0
        ? "Nothing overdue!"
        : `${totalOverdue} overdue item${totalOverdue !== 1 ? "s" : ""}`,
  });

  // --- 4. Payment Activity (0-25 points) ---
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split("T")[0];

  const recentLoanPayments = payments.filter((p) => p.date >= thirtyDaysStr);
  const recentBillPayments = billPayments.filter((p) => p.date >= thirtyDaysStr);
  const totalRecentPayments = recentLoanPayments.length + recentBillPayments.length;

  const expectedPayments = activeLoans.length + activeBills.length;

  let activityPoints = 0;
  if (expectedPayments === 0) {
    activityPoints = 25;
  } else {
    const ratio = Math.min(1, totalRecentPayments / expectedPayments);
    activityPoints = Math.round(ratio * 25);
  }
  breakdown.push({
    label: "Payment Activity",
    points: activityPoints,
    maxPoints: 25,
    detail:
      totalRecentPayments === 0
        ? expectedPayments === 0
          ? "No obligations to pay"
          : "No payments in the last 30 days"
        : `${totalRecentPayments} payment${totalRecentPayments !== 1 ? "s" : ""} in the last 30 days`,
  });

  // --- Compute total ---
  const score = breakdown.reduce((s, b) => s + b.points, 0);

  let grade: HealthScore["grade"];
  let color: string;
  if (score >= 85) {
    grade = "Excellent";
    color = "text-green-600";
  } else if (score >= 70) {
    grade = "Good";
    color = "text-emerald-600";
  } else if (score >= 50) {
    grade = "Fair";
    color = "text-amber-600";
  } else if (score >= 30) {
    grade = "Needs Work";
    color = "text-orange-600";
  } else {
    grade = "Critical";
    color = "text-destructive";
  }

  return { score, grade, color, breakdown };
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
