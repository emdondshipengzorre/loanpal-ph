import { Loan } from "./types";

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
