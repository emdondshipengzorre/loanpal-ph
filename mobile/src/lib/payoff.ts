import { Loan } from "./types";

export interface PayoffStep {
  month: number;
  loanId: string;
  loanName: string;
  payment: number;
  remainingAfter: number;
  paidOff: boolean;
}

export interface PayoffResult {
  strategy: "snowball" | "avalanche";
  totalMonths: number;
  totalPaid: number;
  steps: PayoffStep[];
  monthlyBreakdown: { month: number; totalPayment: number; totalRemaining: number }[];
}

export function calculateSnowball(loans: Loan[], extraBudget: number = 0): PayoffResult {
  return calculate(loans, extraBudget, "snowball");
}

export function calculateAvalanche(loans: Loan[], extraBudget: number = 0): PayoffResult {
  return calculate(loans, extraBudget, "avalanche");
}

function calculate(
  loans: Loan[],
  extraBudget: number,
  strategy: "snowball" | "avalanche"
): PayoffResult {
  const active = loans
    .filter((l) => l.status === "active" && l.remainingBalance > 0)
    .map((l) => ({
      id: l.id,
      name: l.app,
      balance: l.remainingBalance,
      payment: l.monthlyPayment,
    }));

  if (active.length === 0) {
    return { strategy, totalMonths: 0, totalPaid: 0, steps: [], monthlyBreakdown: [] };
  }

  if (strategy === "snowball") {
    active.sort((a, b) => a.balance - b.balance);
  } else {
    active.sort((a, b) => {
      const ratioA = a.payment / a.balance;
      const ratioB = b.payment / b.balance;
      return ratioB - ratioA;
    });
  }

  const balances = new Map(active.map((l) => [l.id, l.balance]));
  const steps: PayoffStep[] = [];
  const monthlyBreakdown: PayoffResult["monthlyBreakdown"] = [];
  let totalPaid = 0;
  let month = 0;
  const MAX_MONTHS = 360;

  while (month < MAX_MONTHS) {
    const remaining = active.filter((l) => (balances.get(l.id) ?? 0) > 0);
    if (remaining.length === 0) break;

    month++;
    let freed = extraBudget;
    let monthTotal = 0;

    for (const loan of active) {
      const bal = balances.get(loan.id) ?? 0;
      if (bal <= 0) {
        freed += loan.payment;
        continue;
      }

      let pay = loan.payment;
      if (loan.id === remaining[0].id) {
        pay += freed;
        freed = 0;
      }

      pay = Math.min(pay, bal);
      const newBal = Math.max(0, bal - pay);
      balances.set(loan.id, newBal);
      totalPaid += pay;
      monthTotal += pay;

      steps.push({
        month,
        loanId: loan.id,
        loanName: loan.name,
        payment: pay,
        remainingAfter: newBal,
        paidOff: newBal === 0,
      });
    }

    const totalRemaining = Array.from(balances.values()).reduce((s, b) => s + b, 0);
    monthlyBreakdown.push({ month, totalPayment: monthTotal, totalRemaining });
  }

  return { strategy, totalMonths: month, totalPaid, steps, monthlyBreakdown };
}
