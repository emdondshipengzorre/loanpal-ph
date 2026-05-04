"use client";

import { useEffect, useState } from "react";
import { fetchBillPaymentsByBillId } from "@/lib/storage";
import { BillPayment } from "@/lib/types";
import { formatPHP, formatDate } from "@/lib/dates";

interface BillPaymentHistoryProps {
  billId: string;
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-PH", { month: "short", year: "numeric" });
}

export function BillPaymentHistory({ billId }: BillPaymentHistoryProps) {
  const [payments, setPayments] = useState<BillPayment[]>([]);

  useEffect(() => {
    fetchBillPaymentsByBillId(billId).then((data) =>
      setPayments(
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      )
    );
  }, [billId]);

  if (payments.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Payment history
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
              <span className="text-xs text-muted-foreground/70">
                ({formatPeriod(p.period)})
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
