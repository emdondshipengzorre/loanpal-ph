import { LOAN_APPS, LoanApp } from "./types";

export interface ParsedLoanData {
  app?: LoanApp;
  amountBorrowed?: number;
  remainingBalance?: number;
  monthlyPayment?: number;
  nextDueDate?: string;
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const {
    data: { text },
  } = await Tesseract.recognize(imageFile, "eng", {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(m.progress);
      }
    },
  });
  return text;
}

function extractAmounts(text: string): number[] {
  const patterns = [
    /(?:PHP|₱|Php)\s*([\d,]+(?:\.\d{2})?)/g,
    /([\d,]+(?:\.\d{2})?)\s*(?:PHP|php|pesos?)/g,
    /(?:amount|total|balance|payment|installment|monthly|due|borrowed|principal|outstanding|remaining)[:\s]*(?:PHP|₱|Php)?\s*([\d,]+(?:\.\d{2})?)/gi,
  ];

  const amounts: number[] = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const numStr = (match[1] || match[2]).replace(/,/g, "");
      const num = parseFloat(numStr);
      if (num > 0 && num < 10_000_000) {
        amounts.push(num);
      }
    }
  }
  return [...new Set(amounts)].sort((a, b) => b - a);
}

function extractDate(text: string): string | undefined {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i,
  ];

  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (!match) continue;

    if (pattern === datePatterns[0]) {
      const [, d, m, y] = match;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    if (pattern === datePatterns[1]) {
      const [, y, m, d] = match;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    if (pattern === datePatterns[2]) {
      const [, mon, d, y] = match;
      const m = months[mon.slice(0, 3).toLowerCase()];
      if (m) return `${y}-${m}-${d.padStart(2, "0")}`;
    }
    if (pattern === datePatterns[3]) {
      const [, d, mon, y] = match;
      const m = months[mon.slice(0, 3).toLowerCase()];
      if (m) return `${y}-${m}-${d.padStart(2, "0")}`;
    }
  }
  return undefined;
}

export function parseLoanText(text: string): ParsedLoanData {
  const result: ParsedLoanData = {};
  const lower = text.toLowerCase();

  for (const appName of LOAN_APPS) {
    if (appName === "Other") continue;
    if (lower.includes(appName.toLowerCase())) {
      result.app = appName;
      break;
    }
  }

  const amounts = extractAmounts(text);
  if (amounts.length >= 1) result.amountBorrowed = amounts[0];
  if (amounts.length >= 2) result.monthlyPayment = amounts[amounts.length - 1];
  if (amounts.length >= 3) result.remainingBalance = amounts[1];

  const monthlyMatch = text.match(
    /(?:monthly|installment|payment)[:\s]*(?:PHP|₱|Php)?\s*([\d,]+(?:\.\d{2})?)/i
  );
  if (monthlyMatch) {
    result.monthlyPayment = parseFloat(monthlyMatch[1].replace(/,/g, ""));
  }

  const balanceMatch = text.match(
    /(?:remaining|balance|outstanding)[:\s]*(?:PHP|₱|Php)?\s*([\d,]+(?:\.\d{2})?)/i
  );
  if (balanceMatch) {
    result.remainingBalance = parseFloat(balanceMatch[1].replace(/,/g, ""));
  }

  result.nextDueDate = extractDate(text);

  return result;
}
