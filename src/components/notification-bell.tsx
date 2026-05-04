"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertItem } from "@/lib/alerts";
import { useNotifications } from "@/lib/use-notifications";
import { formatPHP, formatDate } from "@/lib/dates";

interface NotificationBellProps {
  alerts: AlertItem[];
}

export function NotificationBell({ alerts }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { enabled, permission, toggle } = useNotifications();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative" />
        }
      >
        <Bell className="size-4" />
        {alerts.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alerts & Notifications</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Browser notifications</p>
              <p className="text-xs text-muted-foreground">
                {permission === "unsupported"
                  ? "Not supported on this browser"
                  : permission === "denied"
                    ? "Blocked — check browser settings"
                    : enabled
                      ? "You'll get alerts for upcoming payments"
                      : "Get reminded before payments are due"}
              </p>
            </div>
            <Button
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={toggle}
              disabled={
                permission === "unsupported" || permission === "denied"
              }
            >
              {enabled ? "On" : "Off"}
            </Button>
          </div>

          {alerts.length === 0 ? (
            <div className="py-6 text-center">
              <Bell className="mx-auto mb-2 size-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                All clear! No upcoming payments.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    alert.urgency === "overdue"
                      ? "border-destructive/20 bg-destructive/5"
                      : "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{alert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.type === "loan" ? "Loan" : "Bill"}
                      {" — "}
                      {alert.daysUntil < 0
                        ? `overdue since ${formatDate(alert.dueDate)}`
                        : alert.daysUntil === 0
                          ? "due today!"
                          : `due in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPHP(alert.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
