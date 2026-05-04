"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Bill, BILL_CATEGORY_LABELS } from "@/lib/types";
import { removeBill, modifyBill, recordBillPayment } from "@/lib/storage";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { formatPHP, ordinalSuffix, getNextDueDate, getDaysUntilDue, getCurrentPeriod } from "@/lib/dates";
import { RecordBillPaymentDialog } from "./record-bill-payment-dialog";
import { BillPaymentHistory } from "./bill-payment-history";

interface BillCardProps {
  bill: Bill;
  isPaidThisMonth: boolean;
  onUpdate: () => void;
}

export function BillCard({ bill, isPaidThisMonth, onUpdate }: BillCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  const displayName =
    bill.provider === "Other"
      ? bill.customProviderName || "Other"
      : bill.provider;
  const daysUntilDue = getDaysUntilDue(bill.dueDay);

  const calendarUrl = generateGoogleCalendarUrl({
    title: `${displayName} bill payment — ${formatPHP(bill.typicalAmount)}`,
    date: getNextDueDate(bill.dueDay),
    description: `Monthly ${displayName} bill — ${formatPHP(bill.typicalAmount)}`,
    recurring: true,
  });

  async function handleDelete() {
    await removeBill(bill.id);
    onUpdate();
  }

  async function handleToggleStatus() {
    await modifyBill({
      ...bill,
      status: bill.status === "active" ? "paused" : "active",
    });
    onUpdate();
  }

  async function handleQuickPay() {
    const today = new Date().toISOString().split("T")[0];
    await recordBillPayment(
      bill.id,
      bill.typicalAmount,
      today,
      getCurrentPeriod()
    );
    onUpdate();
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary sm:h-10 sm:w-10 sm:rounded-xl">
              {displayName.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold sm:text-base">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {BILL_CATEGORY_LABELS[bill.category]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isPaidThisMonth && (
              <Badge variant="secondary">Paid</Badge>
            )}
            <Badge
              variant={bill.status === "active" ? "default" : "outline"}
            >
              {bill.status === "active" ? "Active" : "Paused"}
            </Badge>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm sm:mt-4 sm:gap-4">
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">Amount</p>
            <p className="truncate text-xs font-medium sm:text-sm">
              {formatPHP(bill.typicalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">Due date</p>
            <p className="text-xs font-medium sm:text-sm">
              Every {ordinalSuffix(bill.dueDay)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">Status</p>
            <p className="text-xs font-medium sm:text-sm">
              {isPaidThisMonth ? (
                <span className="text-green-600">Paid this month</span>
              ) : bill.status === "paused" ? (
                <span className="text-muted-foreground">Paused</span>
              ) : daysUntilDue <= 3 && daysUntilDue >= 0 ? (
                <span className="text-destructive">Due soon!</span>
              ) : daysUntilDue < 0 ? (
                <span className="text-destructive">Overdue</span>
              ) : (
                <span className="text-muted-foreground">
                  {daysUntilDue} days
                </span>
              )}
            </p>
          </div>
        </div>

        {bill.notes && (
          <p className="mt-2 text-xs text-muted-foreground/70">
            {bill.notes}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          {bill.status === "active" && !isPaidThisMonth && (
            <>
              <RecordBillPaymentDialog
                billId={bill.id}
                billName={displayName}
                typicalAmount={bill.typicalAmount}
                onPaymentRecorded={onUpdate}
              />
              <Button variant="outline" size="sm" onClick={handleQuickPay}>
                Mark paid
              </Button>
            </>
          )}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon-sm" />}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {bill.status === "active" ? "Pause" : "Resume"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? "Hide history" : "History"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => window.open("https://gcash.com", "_blank")}
              >
                Pay via GCash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open("https://www.maya.ph", "_blank")}
              >
                Pay via Maya
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(calendarUrl, "_blank")}
              >
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive data-highlighted:text-destructive"
                onClick={handleDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showHistory && <BillPaymentHistory billId={bill.id} />}
      </CardContent>
    </Card>
  );
}
