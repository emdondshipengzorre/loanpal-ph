import { Loan, Payment } from "./types";
import { savePayment } from "./payments";

const STORAGE_KEY = "loanpal-loans";

export function getLoans(): Loan[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLoan(loan: Loan): void {
  const loans = getLoans();
  loans.push(loan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

export function deleteLoan(id: string): void {
  const loans = getLoans().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

export function updateLoan(updated: Loan): void {
  const loans = getLoans().map((l) => (l.id === updated.id ? updated : l));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

export function recordPayment(
  loanId: string,
  amount: number,
  date: string,
  note?: string
): void {
  const payment: Payment = {
    id: crypto.randomUUID(),
    loanId,
    amount,
    date,
    note,
    createdAt: new Date().toISOString(),
  };
  savePayment(payment);

  const loan = getLoans().find((l) => l.id === loanId);
  if (!loan) return;

  const newBalance = Math.max(0, loan.remainingBalance - amount);

  const due = new Date(loan.nextDueDate + "T00:00:00");
  due.setMonth(due.getMonth() + 1);
  const nextDue = due.toISOString().split("T")[0];

  updateLoan({
    ...loan,
    remainingBalance: newBalance,
    nextDueDate: nextDue,
    status: newBalance === 0 ? "paid" : "active",
  });
}
