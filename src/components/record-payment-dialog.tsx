"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { recordLoanPayment } from "@/lib/storage";

interface RecordPaymentDialogProps {
  loanId: string;
  loanName: string;
  monthlyPayment: number;
  remainingBalance: number;
  onPaymentRecorded: () => void;
}

export function RecordPaymentDialog({
  loanId,
  loanName,
  monthlyPayment,
  remainingBalance,
  onPaymentRecorded,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(monthlyPayment));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    await recordLoanPayment(loanId, parsed, date, note || undefined);
    setAmount(String(monthlyPayment));
    setDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setOpen(false);
    onPaymentRecorded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" data-icon="inline-start" />
        Record payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment — {loanName}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Remaining balance: PHP{" "}
          {remainingBalance.toLocaleString("en-PH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="payAmount">Amount paid (PHP)</Label>
            <Input
              id="payAmount"
              type="number"
              min="0"
              max={remainingBalance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payDate">Payment date</Label>
            <Input
              id="payDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payNote">Note (optional)</Label>
            <Input
              id="payNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. partial payment, advance"
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
