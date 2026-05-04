import { Loan, Payment } from "./types";

const LOANS_KEY = "loanpal-loans";
const PAYMENTS_KEY = "loanpal-payments";

function useSupabase() {
  return (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getSupabase() {
  const { supabase } = await import("./supabase");
  return supabase;
}

// --- Auth ---

export async function signInWithGoogle() {
  const sb = await getSupabase();
  return sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/` },
  });
}

export async function signOut() {
  const sb = await getSupabase();
  return sb.auth.signOut();
}

export async function getUser() {
  const sb = await getSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

export async function onAuthChange(
  callback: (user: { id: string; email?: string } | null) => void
) {
  const sb = await getSupabase();
  return sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

// --- Loans ---

export async function fetchLoans(): Promise<Loan[]> {
  if (!useSupabase()) {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(LOANS_KEY);
    return data ? JSON.parse(data) : [];
  }
  const sb = await getSupabase();
  const { data } = await sb
    .from("loans")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(dbLoanToLoan);
}

export async function createLoan(loan: Loan): Promise<void> {
  if (!useSupabase()) {
    if (typeof window === "undefined") return;
    const loans = JSON.parse(localStorage.getItem(LOANS_KEY) || "[]");
    loans.push(loan);
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    return;
  }
  const sb = await getSupabase();
  const user = await getUser();
  await sb.from("loans").insert(loanToDb(loan, user?.id));
}

export async function modifyLoan(updated: Loan): Promise<void> {
  if (!useSupabase()) {
    if (typeof window === "undefined") return;
    const loans: Loan[] = JSON.parse(
      localStorage.getItem(LOANS_KEY) || "[]"
    ).map((l: Loan) => (l.id === updated.id ? updated : l));
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    return;
  }
  const sb = await getSupabase();
  await sb
    .from("loans")
    .update({
      remaining_balance: updated.remainingBalance,
      next_due_date: updated.nextDueDate,
      status: updated.status,
    })
    .eq("id", updated.id);
}

export async function removeLoan(id: string): Promise<void> {
  if (!useSupabase()) {
    if (typeof window === "undefined") return;
    const loans = JSON.parse(localStorage.getItem(LOANS_KEY) || "[]").filter(
      (l: Loan) => l.id !== id
    );
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    return;
  }
  const sb = await getSupabase();
  await sb.from("loans").delete().eq("id", id);
}

// --- Payments ---

export async function fetchPaymentsByLoanId(
  loanId: string
): Promise<Payment[]> {
  if (!useSupabase()) {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(PAYMENTS_KEY);
    const all: Payment[] = data ? JSON.parse(data) : [];
    return all.filter((p) => p.loanId === loanId);
  }
  const sb = await getSupabase();
  const { data } = await sb
    .from("payments")
    .select("*")
    .eq("loan_id", loanId)
    .order("date", { ascending: false });
  return (data ?? []).map(dbPaymentToPayment);
}

export async function createPayment(payment: Payment): Promise<void> {
  if (!useSupabase()) {
    if (typeof window === "undefined") return;
    const payments = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || "[]");
    payments.push(payment);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    return;
  }
  const sb = await getSupabase();
  const user = await getUser();
  await sb.from("payments").insert(paymentToDb(payment, user?.id));
}

// --- Record payment (combines payment + loan update) ---

export async function recordLoanPayment(
  loanId: string,
  amount: number,
  date: string,
  note?: string
): Promise<void> {
  const payment: Payment = {
    id: crypto.randomUUID(),
    loanId,
    amount,
    date,
    note,
    createdAt: new Date().toISOString(),
  };
  await createPayment(payment);

  const loans = await fetchLoans();
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return;

  const newBalance = Math.max(0, loan.remainingBalance - amount);
  const due = new Date(loan.nextDueDate + "T00:00:00");
  due.setMonth(due.getMonth() + 1);
  const nextDue = due.toISOString().split("T")[0];

  await modifyLoan({
    ...loan,
    remainingBalance: newBalance,
    nextDueDate: nextDue,
    status: newBalance === 0 ? "paid" : "active",
  });
}

// --- DB <-> App type mappers ---

function dbLoanToLoan(row: Record<string, unknown>): Loan {
  return {
    id: row.id as string,
    app: row.app as Loan["app"],
    customAppName: (row.custom_app_name as string) || undefined,
    amountBorrowed: row.amount_borrowed as number,
    remainingBalance: row.remaining_balance as number,
    monthlyPayment: row.monthly_payment as number,
    nextDueDate: row.next_due_date as string,
    status: row.status as Loan["status"],
    createdAt: row.created_at as string,
  };
}

function loanToDb(loan: Loan, userId?: string) {
  return {
    id: loan.id,
    user_id: userId,
    app: loan.app,
    custom_app_name: loan.customAppName || null,
    amount_borrowed: loan.amountBorrowed,
    remaining_balance: loan.remainingBalance,
    monthly_payment: loan.monthlyPayment,
    next_due_date: loan.nextDueDate,
    status: loan.status,
    created_at: loan.createdAt,
  };
}

function dbPaymentToPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    loanId: row.loan_id as string,
    amount: row.amount as number,
    date: row.date as string,
    note: (row.note as string) || undefined,
    createdAt: row.created_at as string,
  };
}

function paymentToDb(payment: Payment, userId?: string) {
  return {
    id: payment.id,
    user_id: userId,
    loan_id: payment.loanId,
    amount: payment.amount,
    date: payment.date,
    note: payment.note || null,
    created_at: payment.createdAt,
  };
}
