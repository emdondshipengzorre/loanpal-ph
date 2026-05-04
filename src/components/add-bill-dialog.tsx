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
import {
  BILL_CATEGORIES,
  BILL_CATEGORY_LABELS,
  BILL_PROVIDERS,
  Bill,
  BillCategory,
} from "@/lib/types";
import { createBill } from "@/lib/storage";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { buttonVariants } from "@/components/ui/button";
import { formatPHP, getNextDueDate, ordinalSuffix } from "@/lib/dates";

interface AddBillDialogProps {
  onBillAdded: () => void;
  triggerLabel?: string;
  triggerSize?: "sm" | "lg" | "default";
  triggerClassName?: string;
}

export function AddBillDialog({
  onBillAdded,
  triggerLabel,
  triggerSize = "default",
  triggerClassName,
}: AddBillDialogProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBill, setLastBill] = useState<Bill | null>(null);

  const [category, setCategory] = useState<BillCategory | "">("");
  const [provider, setProvider] = useState("");
  const [customProviderName, setCustomProviderName] = useState("");
  const [typicalAmount, setTypicalAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setCategory("");
    setProvider("");
    setCustomProviderName("");
    setTypicalAmount("");
    setDueDay("");
    setNotes("");
    setShowSuccess(false);
    setLastBill(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !provider) return;

    const bill: Bill = {
      id: crypto.randomUUID(),
      category: category as BillCategory,
      provider,
      customProviderName: provider === "Other" ? customProviderName : undefined,
      typicalAmount: parseFloat(typicalAmount),
      dueDay: parseInt(dueDay),
      status: "active",
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    await createBill(bill);
    setLastBill(bill);
    setShowSuccess(true);
    onBillAdded();
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  }

  const providers = category ? BILL_PROVIDERS[category as BillCategory] : [];
  const displayName =
    lastBill?.provider === "Other"
      ? lastBill?.customProviderName || "Other"
      : lastBill?.provider;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger
        render={<Button size={triggerSize} className={triggerClassName} />}
      >
        {triggerLabel ?? "Add bill"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {showSuccess && lastBill ? (
          <>
            <DialogHeader>
              <DialogTitle>Bill added!</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                {displayName} — {formatPHP(lastBill.typicalAmount)} due every{" "}
                {ordinalSuffix(lastBill.dueDay)}
              </p>
              <div className="rounded-lg border p-4 text-center">
                <p className="mb-2 text-sm font-medium">
                  Add payment reminders to Google Calendar?
                </p>
                <a
                  href={generateGoogleCalendarUrl({
                    title: `${displayName} bill payment — ${formatPHP(lastBill.typicalAmount)}`,
                    date: getNextDueDate(lastBill.dueDay),
                    description: `Monthly ${displayName} bill — ${formatPHP(lastBill.typicalAmount)}`,
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
              <DialogTitle>Add a bill</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="billCategory">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory((v ?? "") as BillCategory | "");
                    setProvider("");
                    setCustomProviderName("");
                  }}
                >
                  <SelectTrigger id="billCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {BILL_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {category && (
                <div className="grid gap-2">
                  <Label htmlFor="billProvider">Provider</Label>
                  <Select
                    value={provider}
                    onValueChange={(v) => setProvider(v ?? "")}
                  >
                    <SelectTrigger id="billProvider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {provider === "Other" && (
                <div className="grid gap-2">
                  <Label htmlFor="customProvider">Provider name</Label>
                  <Input
                    id="customProvider"
                    value={customProviderName}
                    onChange={(e) => setCustomProviderName(e.target.value)}
                    placeholder="Enter provider name"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="billAmount">Typical amount (PHP)</Label>
                <Input
                  id="billAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={typicalAmount}
                  onChange={(e) => setTypicalAmount(e.target.value)}
                  placeholder="e.g. 3500"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billDueDay">Due day of month (1-31)</Label>
                <Input
                  id="billDueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="e.g. 15"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billNotes">Notes (optional)</Label>
                <Input
                  id="billNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. account number, meter ID"
                />
              </div>

              <Button type="submit" className="mt-2">
                Add bill
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
