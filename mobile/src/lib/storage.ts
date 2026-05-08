import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { enqueue } from "./sync-queue";
import { Loan, Payment, Bill, BillPayment } from "./types";

const KEYS = {
  loans: "loanpal-loans",
  payments: "loanpal-payments",
  bills: "loanpal-bills",
  billPayments: "loanpal-bill-payments",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function getUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

// --- Loans ---

export async function fetchLoans(): Promise<Loan[]> {
  const user = await getUser();
  if (user) {
    const { data } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      return data.map(mapDbLoan);
    }
  }
  const stored = await AsyncStorage.getItem(KEYS.loans);
  return stored ? JSON.parse(stored) : [];
}

export async function createLoan(loanData: Omit<Loan, "id" | "createdAt">): Promise<Loan> {
  const loan: Loan = {
    ...loanData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const user = await getUser();
  if (user) {
    const row = {
      id: loan.id,
      user_id: user.id,
      app: loan.app,
      custom_app_name: loan.customAppName || null,
      amount_borrowed: loan.amountBorrowed,
      remaining_balance: loan.remainingBalance,
      monthly_payment: loan.monthlyPayment,
      next_due_date: loan.nextDueDate,
      status: loan.status,
      created_at: loan.createdAt,
    };
    try {
      await supabase.from("loans").insert(row);
    } catch {
      await enqueue({ table: "loans", type: "insert", data: row });
    }
  }

  const existing = await fetchLoansLocal();
  existing.unshift(loan);
  await AsyncStorage.setItem(KEYS.loans, JSON.stringify(existing));
  return loan;
}

export async function modifyLoan(id: string, updates: Partial<Loan>): Promise<void> {
  const user = await getUser();
  if (user) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.remainingBalance !== undefined) dbUpdates.remaining_balance = updates.remainingBalance;
    if (updates.monthlyPayment !== undefined) dbUpdates.monthly_payment = updates.monthlyPayment;
    if (updates.nextDueDate !== undefined) dbUpdates.next_due_date = updates.nextDueDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.app !== undefined) dbUpdates.app = updates.app;
    if (updates.customAppName !== undefined) dbUpdates.custom_app_name = updates.customAppName;
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("loans").update(dbUpdates).eq("id", id).eq("user_id", user.id);
    }
  }

  const loans = await fetchLoansLocal();
  const idx = loans.findIndex((l) => l.id === id);
  if (idx !== -1) {
    loans[idx] = { ...loans[idx], ...updates };
    await AsyncStorage.setItem(KEYS.loans, JSON.stringify(loans));
  }
}

export async function removeLoan(id: string): Promise<void> {
  const user = await getUser();
  if (user) {
    await supabase.from("loans").delete().eq("id", id).eq("user_id", user.id);
  }
  const loans = await fetchLoansLocal();
  await AsyncStorage.setItem(KEYS.loans, JSON.stringify(loans.filter((l) => l.id !== id)));
}

// --- Payments ---

export async function fetchAllPayments(): Promise<Payment[]> {
  const user = await getUser();
  if (user) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (data && data.length > 0) {
      return data.map(mapDbPayment);
    }
  }
  const stored = await AsyncStorage.getItem(KEYS.payments);
  return stored ? JSON.parse(stored) : [];
}

export async function recordLoanPayment(
  loanId: string,
  amount: number,
  note?: string
): Promise<Payment> {
  const payment: Payment = {
    id: generateId(),
    loanId,
    amount,
    date: new Date().toISOString().split("T")[0],
    note,
    createdAt: new Date().toISOString(),
  };

  const user = await getUser();
  if (user) {
    const row = {
      id: payment.id,
      user_id: user.id,
      loan_id: payment.loanId,
      amount: payment.amount,
      date: payment.date,
      note: payment.note || null,
      created_at: payment.createdAt,
    };
    try {
      await supabase.from("payments").insert(row);
    } catch {
      await enqueue({ table: "payments", type: "insert", data: row });
    }
  }

  const existing = await fetchPaymentsLocal();
  existing.unshift(payment);
  await AsyncStorage.setItem(KEYS.payments, JSON.stringify(existing));
  return payment;
}

// --- Bills ---

export async function fetchBills(): Promise<Bill[]> {
  const user = await getUser();
  if (user) {
    const { data } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      return data.map(mapDbBill);
    }
  }
  const stored = await AsyncStorage.getItem(KEYS.bills);
  return stored ? JSON.parse(stored) : [];
}

export async function createBill(billData: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
  const bill: Bill = {
    ...billData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const user = await getUser();
  if (user) {
    const row = {
      id: bill.id,
      user_id: user.id,
      category: bill.category,
      provider: bill.provider,
      custom_provider_name: bill.customProviderName || null,
      typical_amount: bill.typicalAmount,
      due_day: bill.dueDay,
      status: bill.status,
      notes: bill.notes || null,
      created_at: bill.createdAt,
    };
    try {
      await supabase.from("bills").insert(row);
    } catch {
      await enqueue({ table: "bills", type: "insert", data: row });
    }
  }

  const existing = await fetchBillsLocal();
  existing.unshift(bill);
  await AsyncStorage.setItem(KEYS.bills, JSON.stringify(existing));
  return bill;
}

export async function modifyBill(id: string, updates: Partial<Bill>): Promise<void> {
  const user = await getUser();
  if (user) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
    if (updates.customProviderName !== undefined) dbUpdates.custom_provider_name = updates.customProviderName;
    if (updates.typicalAmount !== undefined) dbUpdates.typical_amount = updates.typicalAmount;
    if (updates.dueDay !== undefined) dbUpdates.due_day = updates.dueDay;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("bills").update(dbUpdates).eq("id", id).eq("user_id", user.id);
    }
  }

  const bills = await fetchBillsLocal();
  const idx = bills.findIndex((b) => b.id === id);
  if (idx !== -1) {
    bills[idx] = { ...bills[idx], ...updates };
    await AsyncStorage.setItem(KEYS.bills, JSON.stringify(bills));
  }
}

export async function removeBill(id: string): Promise<void> {
  const user = await getUser();
  if (user) {
    await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id);
  }
  const bills = await fetchBillsLocal();
  await AsyncStorage.setItem(KEYS.bills, JSON.stringify(bills.filter((b) => b.id !== id)));
}

// --- Bill Payments ---

export async function fetchAllBillPayments(): Promise<BillPayment[]> {
  const user = await getUser();
  if (user) {
    const { data } = await supabase
      .from("bill_payments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (data && data.length > 0) {
      return data.map(mapDbBillPayment);
    }
  }
  const stored = await AsyncStorage.getItem(KEYS.billPayments);
  return stored ? JSON.parse(stored) : [];
}

export async function recordBillPayment(
  billId: string,
  amount: number,
  period: string,
  note?: string
): Promise<BillPayment> {
  const payment: BillPayment = {
    id: generateId(),
    billId,
    amount,
    date: new Date().toISOString().split("T")[0],
    period,
    note,
    createdAt: new Date().toISOString(),
  };

  const user = await getUser();
  if (user) {
    const row = {
      id: payment.id,
      user_id: user.id,
      bill_id: payment.billId,
      amount: payment.amount,
      date: payment.date,
      period: payment.period,
      note: payment.note || null,
      created_at: payment.createdAt,
    };
    try {
      await supabase.from("bill_payments").insert(row);
    } catch {
      await enqueue({ table: "bill_payments", type: "insert", data: row });
    }
  }

  const existing = await fetchBillPaymentsLocal();
  existing.unshift(payment);
  await AsyncStorage.setItem(KEYS.billPayments, JSON.stringify(existing));
  return payment;
}

// --- Local helpers ---

async function fetchLoansLocal(): Promise<Loan[]> {
  const stored = await AsyncStorage.getItem(KEYS.loans);
  return stored ? JSON.parse(stored) : [];
}

async function fetchPaymentsLocal(): Promise<Payment[]> {
  const stored = await AsyncStorage.getItem(KEYS.payments);
  return stored ? JSON.parse(stored) : [];
}

async function fetchBillsLocal(): Promise<Bill[]> {
  const stored = await AsyncStorage.getItem(KEYS.bills);
  return stored ? JSON.parse(stored) : [];
}

async function fetchBillPaymentsLocal(): Promise<BillPayment[]> {
  const stored = await AsyncStorage.getItem(KEYS.billPayments);
  return stored ? JSON.parse(stored) : [];
}

// --- DB mappers (snake_case -> camelCase) ---

function mapDbLoan(row: Record<string, unknown>): Loan {
  return {
    id: row.id as string,
    app: row.app as string,
    customAppName: (row.custom_app_name as string) || undefined,
    amountBorrowed: row.amount_borrowed as number,
    remainingBalance: row.remaining_balance as number,
    monthlyPayment: row.monthly_payment as number,
    nextDueDate: row.next_due_date as string,
    status: row.status as "active" | "paid",
    createdAt: row.created_at as string,
  };
}

function mapDbPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    loanId: row.loan_id as string,
    amount: row.amount as number,
    date: row.date as string,
    note: (row.note as string) || undefined,
    createdAt: row.created_at as string,
  };
}

function mapDbBill(row: Record<string, unknown>): Bill {
  return {
    id: row.id as string,
    category: row.category as Bill["category"],
    provider: row.provider as string,
    customProviderName: (row.custom_provider_name as string) || undefined,
    typicalAmount: row.typical_amount as number,
    dueDay: row.due_day as number,
    status: row.status as "active" | "paused",
    notes: (row.notes as string) || undefined,
    createdAt: row.created_at as string,
  };
}

function mapDbBillPayment(row: Record<string, unknown>): BillPayment {
  return {
    id: row.id as string,
    billId: row.bill_id as string,
    amount: row.amount as number,
    date: row.date as string,
    period: row.period as string,
    note: (row.note as string) || undefined,
    createdAt: row.created_at as string,
  };
}
