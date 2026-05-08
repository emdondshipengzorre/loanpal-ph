import { create } from "zustand";
import { Bill, BillPayment } from "../lib/types";
import * as storage from "../lib/storage";

interface BillState {
  bills: Bill[];
  billPayments: BillPayment[];
  loading: boolean;

  fetchBills: () => Promise<void>;
  fetchBillPayments: () => Promise<void>;
  addBill: (bill: Omit<Bill, "id" | "createdAt">) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  recordBillPayment: (billId: string, amount: number, period: string, note?: string) => Promise<void>;
}

export const useBillStore = create<BillState>((set) => ({
  bills: [],
  billPayments: [],
  loading: false,

  fetchBills: async () => {
    set({ loading: true });
    const bills = await storage.fetchBills();
    set({ bills, loading: false });
  },

  fetchBillPayments: async () => {
    const billPayments = await storage.fetchAllBillPayments();
    set({ billPayments });
  },

  addBill: async (billData) => {
    const bill = await storage.createBill(billData);
    set((s) => ({ bills: [bill, ...s.bills] }));
  },

  updateBill: async (id, updates) => {
    await storage.modifyBill(id, updates);
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  deleteBill: async (id) => {
    await storage.removeBill(id);
    set((s) => ({ bills: s.bills.filter((b) => b.id !== id) }));
  },

  recordBillPayment: async (billId, amount, period, note) => {
    const payment = await storage.recordBillPayment(billId, amount, period, note);
    set((s) => ({ billPayments: [payment, ...s.billPayments] }));
  },
}));
