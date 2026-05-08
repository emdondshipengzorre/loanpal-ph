import { LENDING_APPS } from "./lending-apps";
import { LoanApp } from "./types";

let TextRecognition: { recognize: (uri: string) => Promise<{ text: string }> } | null = null;
try {
  TextRecognition = require("@react-native-ml-kit/text-recognition").default;
} catch {
  // ML Kit not available in this build
}

export interface ParsedLoanData {
  app?: LoanApp;
  amountBorrowed?: number;
  remainingBalance?: number;
  monthlyPayment?: number;
  nextDueDate?: string;
}

export interface ParsedLoanItem {
  amount: number;
  dueDate?: string;
  loanDate?: string;
  app?: LoanApp;
  selected: boolean;
}

export async function extractTextFromImage(imageUri: string): Promise<string> {
  if (!TextRecognition) {
    throw new Error("OCR is not available in this build. A custom dev client with ML Kit is required.");
  }
  const result = await TextRecognition.recognize(imageUri);
  return result.text;
}

export function isOcrAvailable(): boolean {
  return TextRecognition !== null;
}

function extractAmounts(text: string): number[] {
  const patterns = [
    /(?:PHP|₱|Php)\s*([\d,]+(?:\.\d{2})?)/g,
    /([\d,]+(?:\.\d{2})?)\s*(?:PHP|php|pesos?)/g,
    /(?:amount|total|balance|payment|installment|monthly|due|borrowed|principal|outstanding|remaining)[:\s]*(?:PHP|₱|Php)?\s*([\d,]+(?:\.\d{2})?)/gi,
    /(?:^|[^\d])([\d,]{1,10}\.\d{2})(?:[^\d]|$)/gm,
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

  for (const app of LENDING_APPS) {
    if (app.id === "Other") continue;
    if (lower.includes(app.name.toLowerCase())) {
      result.app = app.id;
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

export function parseMultipleLoans(text: string): ParsedLoanItem[] {
  const items: ParsedLoanItem[] = [];
  const lower = text.toLowerCase();

  let detectedApp: LoanApp | undefined;
  for (const app of LENDING_APPS) {
    if (app.id === "Other") continue;
    if (lower.includes(app.name.toLowerCase())) {
      detectedApp = app.id;
      break;
    }
  }

  const blocks = splitIntoBlocks(text);

  if (blocks.length > 1) {
    for (const block of blocks) {
      const item = parseBlock(block, detectedApp);
      if (item) items.push(item);
    }
  }

  if (items.length === 0) {
    const fallback = parseFallbackItems(text, detectedApp);
    items.push(...fallback);
  }

  return items;
}

function splitIntoBlocks(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isDueBoundary = /due\s*date\s*[:.]?\s*\d/i.test(line);
    if (isDueBoundary && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  if (blocks.length <= 1) {
    const altBlocks: string[] = [];
    let altCurrent: string[] = [];
    for (const line of lines) {
      const hasAmount = /[₱P]\s*[\d,]+(?:\.\d{2})/.test(line);
      if (hasAmount && altCurrent.length > 0) {
        const prevHasAmount = altCurrent.some((l) =>
          /[₱P]\s*[\d,]+(?:\.\d{2})/.test(l)
        );
        if (prevHasAmount) {
          altBlocks.push(altCurrent.join("\n"));
          altCurrent = [];
        }
      }
      altCurrent.push(line);
    }
    if (altCurrent.length > 0) altBlocks.push(altCurrent.join("\n"));
    if (altBlocks.length > blocks.length) return altBlocks;
  }

  return blocks;
}

function parseBlock(
  block: string,
  detectedApp?: LoanApp
): ParsedLoanItem | null {
  const amounts = extractAmounts(block);
  if (amounts.length === 0) return null;

  const dueDateMatch = block.match(
    /due\s*date\s*[:.]?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i
  );
  let dueDate: string | undefined;
  if (dueDateMatch) {
    const [, m, d, y] = dueDateMatch;
    dueDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  } else {
    dueDate = extractDate(block);
  }

  const loanDateMatch = block.match(
    /loan\s*date\s*[:.]?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i
  );
  let loanDate: string | undefined;
  if (loanDateMatch) {
    const [, m, d, y] = loanDateMatch;
    loanDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return {
    amount: amounts[0],
    dueDate,
    loanDate,
    app: detectedApp,
    selected: true,
  };
}

function parseFallbackItems(
  text: string,
  detectedApp?: LoanApp
): ParsedLoanItem[] {
  const amountPattern = /(?:PHP|₱|Php|P)\s*([\d,]+(?:\.\d{2})?)/g;
  const amounts: { value: number; index: number }[] = [];
  let match;
  while ((match = amountPattern.exec(text)) !== null) {
    const num = parseFloat(match[1].replace(/,/g, ""));
    if (num > 0 && num < 10_000_000) {
      amounts.push({ value: num, index: match.index });
    }
  }

  const uniqueAmounts = amounts.filter(
    (a, i, arr) => arr.findIndex((b) => b.value === a.value) === i
  );

  if (uniqueAmounts.length <= 1) {
    const single = parseLoanText(text);
    if (single.amountBorrowed || single.monthlyPayment) {
      return [
        {
          amount: single.monthlyPayment || single.amountBorrowed || 0,
          dueDate: single.nextDueDate,
          app: single.app || detectedApp,
          selected: true,
        },
      ];
    }
    return [];
  }

  return uniqueAmounts.map((a) => ({
    amount: a.value,
    dueDate: extractDate(text),
    app: detectedApp,
    selected: true,
  }));
}
