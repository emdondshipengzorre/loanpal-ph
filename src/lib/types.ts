export const LOAN_APPS = [
  "HomeCredit",
  "Tala",
  "Cashalo",
  "Atome",
  "GLoan",
  "GGives",
  "BillEase",
  "Tonik",
  "Maya Credit",
  "ShopeePay Later",
  "Other",
] as const;

export type LoanApp = (typeof LOAN_APPS)[number];

export interface Loan {
  id: string;
  app: LoanApp;
  customAppName?: string;
  amountBorrowed: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  nextDueDate: string;
  status: "active" | "paid";
  createdAt: string;
}
