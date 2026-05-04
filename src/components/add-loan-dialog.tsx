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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOAN_APPS, Loan, LoanApp } from "@/lib/types";
import { saveLoan } from "@/lib/loans";

interface AddLoanDialogProps {
  onLoanAdded: () => void;
  children: React.ReactNode;
}

export function AddLoanDialog({ onLoanAdded, children }: AddLoanDialogProps) {
  const [open, setOpen] = useState(false);
  const [app, setApp] = useState<LoanApp | "">("");
  const [customAppName, setCustomAppName] = useState("");
  const [amountBorrowed, setAmountBorrowed] = useState("");
  const [remainingBalance, setRemainingBalance] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  function resetForm() {
    setApp("");
    setCustomAppName("");
    setAmountBorrowed("");
    setRemainingBalance("");
    setMonthlyPayment("");
    setInterestRate("");
    setNextDueDate("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!app) return;

    const loan: Loan = {
      id: crypto.randomUUID(),
      app: app as LoanApp,
      customAppName: app === "Other" ? customAppName : undefined,
      amountBorrowed: parseFloat(amountBorrowed),
      remainingBalance: remainingBalance
        ? parseFloat(remainingBalance)
        : parseFloat(amountBorrowed),
      monthlyPayment: parseFloat(monthlyPayment),
      interestRate: parseFloat(interestRate) || 0,
      nextDueDate,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    saveLoan(loan);
    resetForm();
    setOpen(false);
    onLoanAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="app">Lending app</Label>
            <Select
              value={app}
              onValueChange={(v) => setApp(v as LoanApp)}
            >
              <SelectTrigger id="app">
                <SelectValue placeholder="Select an app" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_APPS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {app === "Other" && (
            <div className="grid gap-2">
              <Label htmlFor="customApp">App name</Label>
              <Input
                id="customApp"
                value={customAppName}
                onChange={(e) => setCustomAppName(e.target.value)}
                placeholder="Enter app name"
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount borrowed (PHP)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amountBorrowed}
              onChange={(e) => setAmountBorrowed(e.target.value)}
              placeholder="e.g. 10000"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remaining">Remaining balance (PHP)</Label>
            <Input
              id="remaining"
              type="number"
              min="0"
              step="0.01"
              value={remainingBalance}
              onChange={(e) => setRemainingBalance(e.target.value)}
              placeholder="Leave blank if same as amount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="monthly">Monthly payment (PHP)</Label>
              <Input
                id="monthly"
                type="number"
                min="0"
                step="0.01"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="e.g. 2500"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interest">Interest rate (%)</Label>
              <Input
                id="interest"
                type="number"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 2.5"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Next due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="mt-2">
            Add loan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
