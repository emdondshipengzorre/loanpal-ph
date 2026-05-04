"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loan } from "@/lib/types";
import { deleteLoan, updateLoan } from "@/lib/loans";

interface LoanCardProps {
  loan: Loan;
  onUpdate: () => void;
}

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getDaysUntilDue(dateStr: string) {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LoanCard({ loan, onUpdate }: LoanCardProps) {
  const displayName =
    loan.app === "Other" ? loan.customAppName || "Other" : loan.app;
  const daysUntilDue = getDaysUntilDue(loan.nextDueDate);
  const progress =
    ((loan.amountBorrowed - loan.remainingBalance) / loan.amountBorrowed) * 100;

  function handleDelete() {
    deleteLoan(loan.id);
    onUpdate();
  }

  function handleToggleStatus() {
    updateLoan({
      ...loan,
      status: loan.status === "active" ? "paid" : "active",
      remainingBalance: loan.status === "active" ? 0 : loan.remainingBalance,
    });
    onUpdate();
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {displayName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatPHP(loan.remainingBalance)} remaining
              </p>
            </div>
          </div>
          <Badge variant={loan.status === "active" ? "default" : "secondary"}>
            {loan.status === "active" ? "Active" : "Paid"}
          </Badge>
        </div>

        <div className="mt-4">
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

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Borrowed</p>
            <p className="font-medium">{formatPHP(loan.amountBorrowed)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly</p>
            <p className="font-medium">{formatPHP(loan.monthlyPayment)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due date</p>
            <p className="font-medium">
              {formatDate(loan.nextDueDate)}
              {loan.status === "active" && daysUntilDue <= 3 && daysUntilDue >= 0 && (
                <span className="ml-1 text-xs text-destructive">Soon!</span>
              )}
              {loan.status === "active" && daysUntilDue < 0 && (
                <span className="ml-1 text-xs text-destructive">Overdue</span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {loan.status === "active" ? "Mark as paid" : "Reactivate"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
