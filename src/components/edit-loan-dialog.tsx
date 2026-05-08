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
import { Loan, LoanApp } from "@/lib/types";
import { AppPicker } from "./app-picker";
import { modifyLoan } from "@/lib/storage";

interface EditLoanDialogProps {
  loan: Loan;
  onUpdated: () => void;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

export function EditLoanDialog({ loan, onUpdated, externalOpen, onExternalOpenChange }: EditLoanDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onExternalOpenChange ?? setInternalOpen;
  const [app, setApp] = useState(loan.app);
  const [customAppName, setCustomAppName] = useState(loan.customAppName || "");
  const [amountBorrowed, setAmountBorrowed] = useState(String(loan.amountBorrowed));
  const [remainingBalance, setRemainingBalance] = useState(String(loan.remainingBalance));
  const [monthlyPayment, setMonthlyPayment] = useState(String(loan.monthlyPayment));
  const [nextDueDate, setNextDueDate] = useState(loan.nextDueDate);

  function resetForm() {
    setApp(loan.app);
    setCustomAppName(loan.customAppName || "");
    setAmountBorrowed(String(loan.amountBorrowed));
    setRemainingBalance(String(loan.remainingBalance));
    setMonthlyPayment(String(loan.monthlyPayment));
    setNextDueDate(loan.nextDueDate);
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await modifyLoan({
      ...loan,
      app,
      customAppName: app === "Other" ? customAppName : undefined,
      amountBorrowed: parseFloat(amountBorrowed),
      remainingBalance: parseFloat(remainingBalance),
      monthlyPayment: parseFloat(monthlyPayment),
      nextDueDate,
    });
    setOpen(false);
    onUpdated();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {externalOpen === undefined && (
        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
          Edit
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-app">Lending app</Label>
            <AppPicker
              id="edit-app"
              value={app}
              onChange={setApp}
            />
          </div>

          {app === "Other" && (
            <div className="grid gap-2">
              <Label htmlFor="edit-customApp">App name</Label>
              <Input
                id="edit-customApp"
                value={customAppName}
                onChange={(e) => setCustomAppName(e.target.value)}
                placeholder="Enter app name"
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="edit-amount">Amount borrowed (PHP)</Label>
            <Input
              id="edit-amount"
              type="number"
              min="0"
              step="0.01"
              value={amountBorrowed}
              onChange={(e) => setAmountBorrowed(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-remaining">Remaining balance (PHP)</Label>
            <Input
              id="edit-remaining"
              type="number"
              min="0"
              step="0.01"
              value={remainingBalance}
              onChange={(e) => setRemainingBalance(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-monthly">Monthly payment (PHP)</Label>
            <Input
              id="edit-monthly"
              type="number"
              min="0"
              step="0.01"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-dueDate">Next due date</Label>
            <Input
              id="edit-dueDate"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="mt-2">
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
