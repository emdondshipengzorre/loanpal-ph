import { Payment } from "./types";

const STORAGE_KEY = "loanpal-payments";

export function getPayments(): Payment[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getPaymentsByLoanId(loanId: string): Payment[] {
  return getPayments().filter((p) => p.loanId === loanId);
}

export function savePayment(payment: Payment): void {
  const payments = getPayments();
  payments.push(payment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

export function deletePayment(id: string): void {
  const payments = getPayments().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}
