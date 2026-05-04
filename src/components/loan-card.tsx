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
import { Loan } from "@/lib/types";
import { removeLoan, modifyLoan } from "@/lib/storage";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { formatPHP, formatDate, getDaysUntilDate } from "@/lib/dates";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { EditLoanDialog } from "./edit-loan-dialog";
import { PaymentHistory } from "./payment-history";

interface LoanCardProps {
  loan: Loan;
  onUpdate: () => void;
}

export function LoanCard({ loan, onUpdate }: LoanCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const displayName =
    loan.app === "Other" ? loan.customAppName || "Other" : loan.app;
  const daysUntilDue = getDaysUntilDate(loan.nextDueDate);
  const progress =
    ((loan.amountBorrowed - loan.remainingBalance) / loan.amountBorrowed) * 100;

  const calendarUrl = generateGoogleCalendarUrl({
    title: `${displayName} loan payment — ${formatPHP(loan.monthlyPayment)}`,
    date: loan.nextDueDate,
    description: `Monthly payment of ${formatPHP(loan.monthlyPayment)} for ${displayName}.\nRemaining: ${formatPHP(loan.remainingBalance)}`,
    recurring: true,
  });

  async function handleDelete() {
    await removeLoan(loan.id);
    onUpdate();
  }

  async function handleToggleStatus() {
    await modifyLoan({
      ...loan,
      status: loan.status === "active" ? "paid" : "active",
      remainingBalance: loan.status === "active" ? 0 : loan.remainingBalance,
    });
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
                {formatPHP(loan.remainingBalance)} remaining
              </p>
            </div>
          </div>
          <Badge variant={loan.status === "active" ? "default" : "secondary"}>
            {loan.status === "active" ? "Active" : "Paid"}
          </Badge>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Paid off</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm sm:mt-4 sm:gap-4">
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">Borrowed</p>
            <p className="truncate text-xs font-medium sm:text-sm">
              {formatPHP(loan.amountBorrowed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">Monthly</p>
            <p className="truncate text-xs font-medium sm:text-sm">
              {formatPHP(loan.monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">Due date</p>
            <p className="text-xs font-medium sm:text-sm">
              {formatDate(loan.nextDueDate)}
              {loan.status === "active" &&
                daysUntilDue <= 3 &&
                daysUntilDue >= 0 && (
                  <span className="ml-1 text-xs text-destructive">Soon!</span>
                )}
              {loan.status === "active" && daysUntilDue < 0 && (
                <span className="ml-1 text-xs text-destructive">Overdue</span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          {loan.status === "active" && (
            <RecordPaymentDialog
              loanId={loan.id}
              loanName={displayName}
              monthlyPayment={loan.monthlyPayment}
              remainingBalance={loan.remainingBalance}
              onPaymentRecorded={onUpdate}
            />
          )}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon-sm" />}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {loan.status === "active" ? "Mark as paid" : "Reactivate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Edit
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

        <EditLoanDialog
          loan={loan}
          onUpdated={onUpdate}
          externalOpen={editOpen}
          onExternalOpenChange={setEditOpen}
        />

        {showHistory && <PaymentHistory loanId={loan.id} />}
      </CardContent>
    </Card>
  );
}
