"use client";

import { useState } from "react";
import { AlertTriangle, Bell, X } from "lucide-react";
import { AlertItem } from "@/lib/alerts";
import { formatPHP, formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  alerts: AlertItem[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (alerts.length === 0 || dismissed) return null;

  const overdue = alerts.filter((a) => a.urgency === "overdue");
  const dueSoon = alerts.filter((a) => a.urgency === "due-soon");
  const hasOverdue = overdue.length > 0;

  const parts: string[] = [];
  if (overdue.length > 0)
    parts.push(`${overdue.length} overdue`);
  if (dueSoon.length > 0)
    parts.push(`${dueSoon.length} due soon`);
  const summary = parts.join(", ");

  return (
    <div
      className={`mb-4 rounded-xl border p-3 sm:mb-6 sm:p-4 ${
        hasOverdue
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            {hasOverdue ? (
              <AlertTriangle className="size-4 shrink-0" />
            ) : (
              <Bell className="size-4 shrink-0" />
            )}
            {summary}
          </p>
          <div className="mt-1.5 grid gap-1">
            {alerts.slice(0, 5).map((alert) => (
              <p key={alert.id} className="text-xs">
                <span className="font-medium">{alert.name}</span>
                {" — "}
                {formatPHP(alert.amount)}
                {alert.daysUntil < 0
                  ? ` (was due ${formatDate(alert.dueDate)})`
                  : alert.daysUntil === 0
                    ? " (due today!)"
                    : ` (due in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""})`}
              </p>
            ))}
            {alerts.length > 5 && (
              <p className="text-xs opacity-70">
                +{alerts.length - 5} more
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
