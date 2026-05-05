"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";
import { Loan, Bill, BillPayment } from "@/lib/types";
import { formatPHP } from "@/lib/dates";

interface PayDayPlannerProps {
  loans: Loan[];
  bills: Bill[];
  billPayments: BillPayment[];
}

interface PlannerItem {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  type: "loan" | "bill";
  isPaid: boolean;
}

function getDueDayFromLoan(loan: Loan): number {
  return new Date(loan.nextDueDate + "T00:00:00").getDate();
}

export function PayDayPlanner({
  loans,
  bills,
  billPayments,
}: PayDayPlannerProps) {
  const paidBillIds = new Set(billPayments.map((p) => p.billId));

  const items: PlannerItem[] = [
    ...loans
      .filter((l) => l.status === "active")
      .map((l) => ({
        id: l.id,
        name:
          l.app === "Other" ? l.customAppName || "Other" : l.app,
        amount: l.monthlyPayment,
        dueDay: getDueDayFromLoan(l),
        type: "loan" as const,
        isPaid: false,
      })),
    ...bills
      .filter((b) => b.status === "active")
      .map((b) => ({
        id: b.id,
        name:
          b.provider === "Other"
            ? b.customProviderName || "Other"
            : b.provider,
        amount: b.typicalAmount,
        dueDay: b.dueDay,
        type: "bill" as const,
        isPaid: paidBillIds.has(b.id),
      })),
  ];

  const firstHalf = items
    .filter((i) => i.dueDay >= 1 && i.dueDay <= 15)
    .sort((a, b) => a.dueDay - b.dueDay);
  const secondHalf = items
    .filter((i) => i.dueDay >= 16 && i.dueDay <= 31)
    .sort((a, b) => a.dueDay - b.dueDay);

  const firstTotal = firstHalf.reduce((sum, i) => sum + i.amount, 0);
  const secondTotal = secondHalf.reduce((sum, i) => sum + i.amount, 0);
  const grandTotal = firstTotal + secondTotal;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <CalendarDays className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold">Nothing to plan yet</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Add loans or bills first. The planner splits your obligations across your two monthly paychecks.
        </p>
      </div>
    );
  }

  function renderItem(item: PlannerItem) {
    return (
      <div
        key={item.id}
        className="flex items-center justify-between py-1.5"
      >
        <div className="flex items-center gap-2">
          {item.isPaid ? (
            <span className="text-green-600 text-xs">&#10003;</span>
          ) : (
            <span className="text-xs text-muted-foreground/40">&#9675;</span>
          )}
          <span className={`text-sm ${item.isPaid ? "text-muted-foreground line-through" : ""}`}>
            {item.name}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {item.type === "loan" ? "Loan" : "Bill"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {item.dueDay}th
          </span>
          <span className="text-sm font-medium">
            {formatPHP(item.amount)}
          </span>
        </div>
      </div>
    );
  }

  function renderPeriod(
    title: string,
    periodItems: PlannerItem[],
    total: number
  ) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {periodItems.length} payment{periodItems.length !== 1 ? "s" : ""}
          </p>
          {periodItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No payments in this period
            </p>
          ) : (
            <div className="grid gap-0">
              {periodItems.map(renderItem)}
            </div>
          )}
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-sm font-bold">{formatPHP(total)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {renderPeriod("1st — 15th (First paycheck)", firstHalf, firstTotal)}
        {renderPeriod("16th — 31st (Second paycheck)", secondHalf, secondTotal)}
      </div>
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="font-medium">Total monthly obligations</span>
          <span className="text-lg font-bold">{formatPHP(grandTotal)}</span>
        </CardContent>
      </Card>
    </div>
  );
}
