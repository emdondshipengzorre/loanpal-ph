"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ParsedLoanData, extractTextFromImage, parseLoanText } from "@/lib/ocr";

interface OcrUploadProps {
  onParsed: (data: ParsedLoanData) => void;
}

export function OcrUpload({ onParsed }: OcrUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleScan() {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const text = await extractTextFromImage(file, setProgress);
      const parsed = parseLoanText(text);
      onParsed(parsed);
    } catch {
      setError("Could not read the image. Try a clearer screenshot.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid gap-4">
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
              Take a screenshot of your loan plan from the app
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

      {isProcessing && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Scanning...</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {file && !isProcessing && (
        <Button onClick={handleScan}>Scan screenshot</Button>
      )}
    </div>
  );
}
