import { LENDING_APPS, LENDING_APP_IDS } from "./lending-apps";

export { LENDING_APPS };

export const LOAN_APPS = LENDING_APP_IDS;

export type LoanApp = string;

export interface Loan {
  id: string;
  app: LoanApp;
  customAppName?: string;
  amountBorrowed: number;
  remainingBalance: number;
  monthlyPayment: number;
  nextDueDate: string;
  status: "active" | "paid";
  createdAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export const BILL_CATEGORIES = [
  "utilities",
  "telecom",
  "housing",
  "insurance",
  "subscriptions",
  "other",
] as const;

export type BillCategory = (typeof BILL_CATEGORIES)[number];

export const BILL_CATEGORY_LABELS: Record<BillCategory, string> = {
  utilities: "Utilities",
  telecom: "Telecom",
  housing: "Housing",
  insurance: "Insurance",
  subscriptions: "Subscriptions",
  other: "Other",
};

export const BILL_PROVIDERS: Record<BillCategory, readonly string[]> = {
  utilities: ["Meralco", "Visayan Electric", "Manila Water", "Maynilad", "Other"],
  telecom: ["PLDT", "Globe", "Converge", "Smart", "Other"],
  housing: ["Rent", "Condo Dues", "Other"],
  insurance: ["PhilHealth", "SSS", "Pag-IBIG", "Other"],
  subscriptions: ["Netflix", "Spotify", "YouTube Premium", "iCloud", "Other"],
  other: ["Other"],
};

export interface Bill {
  id: string;
  category: BillCategory;
  provider: string;
  customProviderName?: string;
  typicalAmount: number;
  dueDay: number;
  status: "active" | "paused";
  notes?: string;
  createdAt: string;
}

export interface BillPayment {
  id: string;
  billId: string;
  amount: number;
  date: string;
  period: string;
  note?: string;
  createdAt: string;
}
