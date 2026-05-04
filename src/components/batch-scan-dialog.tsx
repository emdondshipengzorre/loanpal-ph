"use client";

import { useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LOAN_APPS, Loan, LoanApp } from "@/lib/types";
import { createLoan } from "@/lib/storage";
import { formatPHP } from "@/lib/dates";
import {
  extractTextFromImage,
  parseMultipleLoans,
  ParsedLoanItem,
} from "@/lib/ocr";

interface BatchScanDialogProps {
  onImported: () => void;
}

type Step = "upload" | "scanning" | "review" | "done";

interface EditableItem extends ParsedLoanItem {
  id: string;
  app: LoanApp;
  customAppName: string;
}

export function BatchScanDialog({ onImported }: BatchScanDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [sharedApp, setSharedApp] = useState<LoanApp>("Other");
  const [sharedCustomName, setSharedCustomName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setProgress(0);
    setError(null);
    setItems([]);
    setImportedCount(0);
    setPreview(null);
    setSharedApp("Other");
    setSharedCustomName("");
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) reset();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
    startScan(selected);
  }

  async function startScan(file: File) {
    setStep("scanning");
    setProgress(0);
    try {
      const text = await extractTextFromImage(file, setProgress);
      const parsed = parseMultipleLoans(text);
      if (parsed.length === 0) {
        setError("No loan items detected. Try a clearer screenshot.");
        setStep("upload");
        return;
      }
      if (parsed[0]?.app) setSharedApp(parsed[0].app);
      setItems(
        parsed.map((p) => ({
          ...p,
          id: crypto.randomUUID(),
          app: p.app || ("Other" as LoanApp),
          customAppName: "",
        }))
      );
      setStep("review");
    } catch {
      setError("Could not scan the image. Try a different screenshot.");
      setStep("upload");
    }
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  }

  function updateItem(id: string, field: string, value: string | number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  async function handleImport() {
    const selected = items.filter((i) => i.selected && i.amount > 0);
    if (selected.length === 0) return;

    for (const item of selected) {
      const loan: Loan = {
        id: crypto.randomUUID(),
        app: sharedApp,
        customAppName: sharedApp === "Other" ? sharedCustomName || undefined : undefined,
        amountBorrowed: item.amount,
        remainingBalance: item.amount,
        monthlyPayment: item.amount,
        nextDueDate: item.dueDate || new Date().toISOString().split("T")[0],
        status: "active",
        createdAt: new Date().toISOString(),
      };
      await createLoan(loan);
    }

    setImportedCount(selected.length);
    setStep("done");
    onImported();
  }

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <ScanLine className="size-4" data-icon="inline-start" />
        Scan
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle>Batch Scan</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Upload a screenshot of your bill list or loan schedule and we'll detect all the items.
            </p>
            <div
              className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
              onClick={() => inputRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="max-h-[200px] rounded-lg object-contain"
                />
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium">
                    Tap to upload a screenshot
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You can also use your camera to capture
                  </p>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        {step === "scanning" && (
          <>
            <DialogHeader>
              <DialogTitle>Scanning...</DialogTitle>
            </DialogHeader>
            {preview && (
              <img
                src={preview}
                alt="Scanning"
                className="max-h-[120px] rounded-lg object-contain opacity-60"
              />
            )}
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Reading text...</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <DialogHeader>
              <DialogTitle>
                Detected: {items.length} item{items.length !== 1 ? "s" : ""}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <div>
                <Label className="text-xs">Lending app (applies to all)</Label>
                <Select
                  value={sharedApp}
                  onValueChange={(v) => setSharedApp((v ?? "Other") as LoanApp)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
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
              {sharedApp === "Other" && (
                <div>
                  <Label className="text-xs">App name</Label>
                  <Input
                    value={sharedCustomName}
                    onChange={(e) => setSharedCustomName(e.target.value)}
                    placeholder="Enter app name"
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Review and edit each item before importing. Uncheck to skip.
            </p>
            <div className="grid max-h-[40vh] gap-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-3 transition-opacity ${
                    item.selected ? "" : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItem(item.id)}
                      className="h-4 w-4 rounded border-muted-foreground/50"
                    />
                    <span className="text-sm font-semibold">
                      {formatPHP(item.amount)}
                    </span>
                    {item.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        due {item.dueDate}
                      </span>
                    )}
                  </div>

                  {item.selected && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Amount (PHP)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "amount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Due date</Label>
                        <Input
                          type="date"
                          value={item.dueDate || ""}
                          onChange={(e) =>
                            updateItem(item.id, "dueDate", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                className="flex-1"
                disabled={selectedCount === 0}
              >
                Import {selectedCount} loan{selectedCount !== 1 ? "s" : ""}
              </Button>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle>Import complete!</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="text-4xl font-bold text-primary">
                {importedCount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                loan{importedCount !== 1 ? "s" : ""} added
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Check each loan card and edit if needed — especially the amount borrowed and remaining balance.
            </p>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
