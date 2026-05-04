"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordBillPayment } from "@/lib/storage";
import { getCurrentPeriod } from "@/lib/dates";

interface RecordBillPaymentDialogProps {
  billId: string;
  billName: string;
  typicalAmount: number;
  onPaymentRecorded: () => void;
}

export function RecordBillPaymentDialog({
  billId,
  billName,
  typicalAmount,
  onPaymentRecorded,
}: RecordBillPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(typicalAmount));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    await recordBillPayment(billId, parsed, date, period, note || undefined);
    setAmount(String(typicalAmount));
    setDate(new Date().toISOString().split("T")[0]);
    setPeriod(getCurrentPeriod());
    setNote("");
    setOpen(false);
    onPaymentRecorded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Record payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment — {billName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="billPayAmount">Amount paid (PHP)</Label>
            <Input
              id="billPayAmount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="billPayDate">Payment date</Label>
            <Input
              id="billPayDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="billPayPeriod">Billing month</Label>
            <Input
              id="billPayPeriod"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="billPayNote">Note (optional)</Label>
            <Input
              id="billPayNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. paid via GCash"
            />
          </div>

          <Button type="submit" className="mt-2">
            Confirm payment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
