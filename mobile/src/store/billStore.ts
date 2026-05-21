import { create } from "zustand";
import { Bill, BillPayment } from "../lib/types";
import * as storage from "../lib/storage";
import { scheduleDueDateReminder, cancelReminder } from "../lib/notifications";
import { getNextDueDate } from "../lib/dates";

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

export const useBillStore = create<BillState>((set, get) => ({
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
    const name = bill.provider === "Other" ? bill.customProviderName || "Other" : bill.provider;
    scheduleDueDateReminder(bill.id, "bill", name, bill.typicalAmount, getNextDueDate(bill.dueDay));
  },

  updateBill: async (id, updates) => {
    await storage.modifyBill(id, updates);
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
    if (updates.dueDay || updates.typicalAmount) {
      const updated = get().bills.find((b) => b.id === id);
      if (updated) {
        await cancelReminder(id);
        const name = updated.provider === "Other" ? updated.customProviderName || "Other" : updated.provider;
        scheduleDueDateReminder(id, "bill", name, updated.typicalAmount, getNextDueDate(updated.dueDay));
      }
    }
  },

  deleteBill: async (id) => {
    await storage.removeBill(id);
    set((s) => ({ bills: s.bills.filter((b) => b.id !== id) }));
    cancelReminder(id);
  },

  recordBillPayment: async (billId, amount, period, note) => {
    const payment = await storage.recordBillPayment(billId, amount, period, note);
    set((s) => ({ billPayments: [payment, ...s.billPayments] }));
  },
}));
