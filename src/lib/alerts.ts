import { Loan, Bill, BillPayment } from "./types";
import {
  getNextDueDate,
  getDaysUntilDue,
  getDaysUntilDate,
  formatPHP,
  formatDate,
  ordinalSuffix,
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

// --- Anti-spam ---

const NOTIFIED_KEY = "loanpal-notified";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function getNotifiedMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "{}");
  } catch {
    return {};
  }
}

function setNotifiedMap(map: Record<string, string>) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map));
}

function cleanOldEntries(map: Record<string, string>): Record<string, string> {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const cleaned: Record<string, string> = {};
  for (const [key, val] of Object.entries(map)) {
    if (new Date(val).getTime() > cutoff) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

function wasRecentlyNotified(itemId: string): boolean {
  const map = getNotifiedMap();
  const last = map[itemId];
  if (!last) return false;
  return Date.now() - new Date(last).getTime() < COOLDOWN_MS;
}

function markAsNotified(itemId: string) {
  const map = cleanOldEntries(getNotifiedMap());
  map[itemId] = new Date().toISOString();
  setNotifiedMap(map);
}

// --- Notification firing ---

function buildNotificationContent(alert: AlertItem): { title: string; body: string } {
  const prefix = alert.urgency === "overdue" ? "Overdue" : "Due soon";
  const title = `${prefix}: ${alert.name}`;

  if (alert.type === "loan") {
    if (alert.urgency === "overdue") {
      return {
        title,
        body: `${formatPHP(alert.amount)} was due ${formatDate(alert.dueDate)}. Pay now to avoid penalties!`,
      };
    }
    return {
      title,
      body: `${formatPHP(alert.amount)} due in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""} on ${formatDate(alert.dueDate)}`,
    };
  }

  const dueDay = new Date(alert.dueDate + "T00:00:00").getDate();
  if (alert.urgency === "overdue") {
    return {
      title,
      body: `~${formatPHP(alert.amount)} was due on the ${ordinalSuffix(dueDay)}. Pay now!`,
    };
  }
  return {
    title,
    body: `~${formatPHP(alert.amount)} due in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""} (every ${ordinalSuffix(dueDay)})`,
  };
}

export function fireNotifications(alerts: AlertItem[]) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  for (const alert of alerts) {
    if (wasRecentlyNotified(alert.id)) continue;
    const { title, body } = buildNotificationContent(alert);
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      tag: `loanpal-${alert.id}`,
    });
    markAsNotified(alert.id);
  }
}
