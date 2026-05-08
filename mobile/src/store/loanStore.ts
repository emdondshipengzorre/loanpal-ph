import { create } from "zustand";
import { Loan, Payment } from "../lib/types";
import * as storage from "../lib/storage";

interface LoanState {
  loans: Loan[];
  payments: Payment[];
  loading: boolean;

  fetchLoans: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  addLoan: (loan: Omit<Loan, "id" | "createdAt">) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  recordPayment: (loanId: string, amount: number, note?: string) => Promise<void>;
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  payments: [],
  loading: false,

  fetchLoans: async () => {
    set({ loading: true });
    const loans = await storage.fetchLoans();
    set({ loans, loading: false });
  },

  fetchPayments: async () => {
    const payments = await storage.fetchAllPayments();
    set({ payments });
  },

  addLoan: async (loanData) => {
    const loan = await storage.createLoan(loanData);
    set((s) => ({ loans: [loan, ...s.loans] }));
  },

  updateLoan: async (id, updates) => {
    await storage.modifyLoan(id, updates);
    set((s) => ({
      loans: s.loans.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  deleteLoan: async (id) => {
    await storage.removeLoan(id);
    set((s) => ({ loans: s.loans.filter((l) => l.id !== id) }));
  },

  recordPayment: async (loanId, amount, note) => {
    const payment = await storage.recordLoanPayment(loanId, amount, note);
    const loan = get().loans.find((l) => l.id === loanId);
    if (loan) {
      const newBalance = Math.max(0, loan.remainingBalance - amount);
      const updates: Partial<Loan> = { remainingBalance: newBalance };
      if (newBalance === 0) updates.status = "paid";

      // Advance due date by one month
      const dueDate = new Date(loan.nextDueDate);
      dueDate.setMonth(dueDate.getMonth() + 1);
      updates.nextDueDate = dueDate.toISOString().split("T")[0];

      await storage.modifyLoan(loanId, updates);
      set((s) => ({
        payments: [payment, ...s.payments],
        loans: s.loans.map((l) => (l.id === loanId ? { ...l, ...updates } : l)),
      }));
    }
  },
}));
