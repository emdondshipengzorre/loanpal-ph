"use client";

import { useState } from "react";
import { getPaymentsByLoanId } from "@/lib/payments";
import { Payment } from "@/lib/types";

interface PaymentHistoryProps {
  loanId: string;
}

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PaymentHistory({ loanId }: PaymentHistoryProps) {
  const [payments] = useState<Payment[]>(() =>
    getPaymentsByLoanId(loanId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (payments.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Payment history</span>
        <span>Total paid: {formatPHP(totalPaid)}</span>
      </div>
      <div className="grid gap-1.5">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {formatDate(p.date)}
              </span>
              {p.note && (
                <span className="text-xs text-muted-foreground/70">
                  — {p.note}
                </span>
              )}
            </div>
            <span className="font-medium">{formatPHP(p.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
