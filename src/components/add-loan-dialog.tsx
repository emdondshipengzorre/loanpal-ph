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
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { buttonVariants } from "@/components/ui/button";
import { OcrUpload } from "./ocr-upload";
import { ParsedLoanData } from "@/lib/ocr";

interface AddLoanDialogProps {
  onLoanAdded: () => void;
  triggerLabel?: string;
  triggerSize?: "sm" | "lg" | "default";
  triggerClassName?: string;
}

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function AddLoanDialog({
  onLoanAdded,
  triggerLabel,
  triggerSize = "default",
  triggerClassName,
}: AddLoanDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"manual" | "scan">("manual");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastLoan, setLastLoan] = useState<Loan | null>(null);
  const [scannedBanner, setScannedBanner] = useState(false);

  const [app, setApp] = useState<LoanApp | "">("");
  const [customAppName, setCustomAppName] = useState("");
  const [amountBorrowed, setAmountBorrowed] = useState("");
  const [remainingBalance, setRemainingBalance] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  function resetForm() {
    setApp("");
    setCustomAppName("");
    setAmountBorrowed("");
    setRemainingBalance("");
    setMonthlyPayment("");
    setNextDueDate("");
    setInputMode("manual");
    setShowSuccess(false);
    setLastLoan(null);
    setScannedBanner(false);
  }

  function handleParsedData(data: ParsedLoanData) {
    if (data.app) setApp(data.app);
    if (data.amountBorrowed) setAmountBorrowed(String(data.amountBorrowed));
    if (data.remainingBalance)
      setRemainingBalance(String(data.remainingBalance));
    if (data.monthlyPayment) setMonthlyPayment(String(data.monthlyPayment));
    if (data.nextDueDate) setNextDueDate(data.nextDueDate);
    setInputMode("manual");
    setScannedBanner(true);
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
      nextDueDate,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    saveLoan(loan);
    setLastLoan(loan);
    setShowSuccess(true);
    onLoanAdded();
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger
        render={<Button size={triggerSize} className={triggerClassName} />}
      >
        {triggerLabel ?? "Add loan"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {showSuccess && lastLoan ? (
          <>
            <DialogHeader>
              <DialogTitle>Loan added!</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                {lastLoan.app === "Other"
                  ? lastLoan.customAppName
                  : lastLoan.app}{" "}
                — {formatPHP(lastLoan.amountBorrowed)}
              </p>
              <div className="rounded-lg border p-4 text-center">
                <p className="mb-2 text-sm font-medium">
                  Add payment reminders to Google Calendar?
                </p>
                <a
                  href={generateGoogleCalendarUrl({
                    title: `${lastLoan.app === "Other" ? lastLoan.customAppName : lastLoan.app} loan payment — ${formatPHP(lastLoan.monthlyPayment)}`,
                    date: lastLoan.nextDueDate,
                    description: `Monthly payment of ${formatPHP(lastLoan.monthlyPayment)}.\nRemaining: ${formatPHP(lastLoan.remainingBalance)}`,
                    recurring: true,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Add to Google Calendar
                </a>
              </div>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a loan</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2">
              <Button
                variant={inputMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("manual")}
              >
                Manual
              </Button>
              <Button
                variant={inputMode === "scan" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("scan")}
              >
                Scan screenshot
              </Button>
            </div>

            {inputMode === "scan" ? (
              <OcrUpload onParsed={handleParsedData} />
            ) : (
              <>
                {scannedBanner && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Review the scanned values below and correct anything that
                    looks wrong.
                  </p>
                )}
                <form onSubmit={handleSubmit} className="grid gap-4">
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
                    {scannedBanner ? "Confirm" : "Add loan"}
                  </Button>
                </form>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
