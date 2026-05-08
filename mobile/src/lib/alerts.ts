import { Loan, Bill, BillPayment } from "./types";
import {
  getNextDueDate,
  getDaysUntilDue,
  getDaysUntilDate,
} from "./dates";

export interface AlertItem {
  id: string;
  type: "loan" | "bill";
  name: string;
  amount: number;
  dueDate: string;
  daysUntil: number;
  urgency: "overdue" | "due-soon";
}

export function computeAlerts(
  loans: Loan[],
  bills: Bill[],
  billPayments: BillPayment[]
): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const loan of loans) {
    if (loan.status !== "active") continue;
    const days = getDaysUntilDate(loan.nextDueDate);
    if (days > 3) continue;
    alerts.push({
      id: loan.id,
      type: "loan",
      name: loan.app === "Other" ? loan.customAppName || "Other" : loan.app,
      amount: loan.monthlyPayment,
      dueDate: loan.nextDueDate,
      daysUntil: days,
      urgency: days < 0 ? "overdue" : "due-soon",
    });
  }

  const paidBillIds = new Set(billPayments.map((p) => p.billId));

  for (const bill of bills) {
    if (bill.status !== "active") continue;
    if (paidBillIds.has(bill.id)) continue;
    const days = getDaysUntilDue(bill.dueDay);
    if (days > 3) continue;
    alerts.push({
      id: bill.id,
      type: "bill",
      name:
        bill.provider === "Other"
          ? bill.customProviderName || "Other"
          : bill.provider,
      amount: bill.typicalAmount,
      dueDate: getNextDueDate(bill.dueDay),
      daysUntil: days,
      urgency: days < 0 ? "overdue" : "due-soon",
    });
  }

  alerts.sort((a, b) => a.daysUntil - b.daysUntil);

  return alerts;
}
