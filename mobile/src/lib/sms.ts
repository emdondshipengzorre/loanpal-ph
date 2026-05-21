import { PermissionsAndroid, Platform } from "react-native";
import { LENDING_APPS } from "./lending-apps";

let SmsAndroid: any = null;
try {
  SmsAndroid = require("react-native-get-sms-android").default;
} catch {}

export interface FinanceSms {
  id: string;
  address: string;
  body: string;
  date: number;
  app?: string;
  amount?: number;
  dueDate?: string;
  type: "loan" | "bill" | "payment" | "reminder" | "promo";
}

const FINANCE_KEYWORDS = [
  "due", "payment", "loan", "balance", "overdue", "installment",
  "amount", "pay", "billing", "peso", "php", "₱", "credit",
  "disbursed", "approved", "repay", "collect", "outstanding",
  "reminder", "settle", "maturity", "penalty", "interest",
  "meralco", "manila water", "maynilad", "pldt", "globe",
  "smart", "converge", "philhealth", "sss", "pag-ibig",
];

const PROMO_KEYWORDS = [
  "promo", "offer", "apply now", "pre-approved", "congratulations",
  "exclusive", "limited time", "avail", "discount",
];

export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    {
      title: "SMS Permission",
      message: "LoanPal needs to read your SMS to find loan and bill reminders automatically.",
      buttonPositive: "Allow",
      buttonNegative: "Deny",
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
}

function readSmsRaw(filter: object): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!SmsAndroid) {
      reject(new Error("SMS reading is only available on Android"));
      return;
    }
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => reject(new Error(fail)),
      (_count: number, smsList: string) => {
        try {
          resolve(JSON.parse(smsList));
        } catch {
          resolve([]);
        }
      }
    );
  });
}

function extractAmount(text: string): number | undefined {
  const patterns = [
    /(?:PHP|₱|Php)\s*([\d,]+(?:\.\d{2})?)/,
    /([\d,]+(?:\.\d{2})?)\s*(?:PHP|php|pesos?)/,
    /(?:amount|total|balance|payment|due)[:\s]*(?:PHP|₱|Php)?\s*([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const num = parseFloat((m[1] || m[2]).replace(/,/g, ""));
      if (num > 0 && num < 10_000_000) return num;
    }
  }
  return undefined;
}

function extractDueDate(text: string): string | undefined {
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };

  const patterns: { re: RegExp; fmt: (m: RegExpMatchArray) => string }[] = [
    {
      re: /(?:due|before|by|on)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
      fmt: (m) => `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`,
    },
    {
      re: /(?:due|before|by|on)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
      fmt: (m) => `${m[3]}-${months[m[1].slice(0, 3).toLowerCase()]}-${m[2].padStart(2, "0")}`,
    },
    {
      re: /(?:due|before|by|on)\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i,
      fmt: (m) => `${m[3]}-${months[m[2].slice(0, 3).toLowerCase()]}-${m[1].padStart(2, "0")}`,
    },
    {
      re: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      fmt: (m) => `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`,
    },
  ];

  for (const { re, fmt } of patterns) {
    const m = text.match(re);
    if (m) return fmt(m);
  }
  return undefined;
}

function classifySms(body: string): FinanceSms["type"] {
  const lower = body.toLowerCase();
  if (PROMO_KEYWORDS.some((k) => lower.includes(k))) return "promo";
  if (/overdue|penalty|past.?due|collect/i.test(lower)) return "reminder";
  if (/paid|received|successful|thank you for.*pay/i.test(lower)) return "payment";
  if (/due|billing|statement|invoice/i.test(lower)) return "bill";
  return "loan";
}

function detectApp(body: string): string | undefined {
  const lower = body.toLowerCase();
  for (const app of LENDING_APPS) {
    if (app.id === "Other") continue;
    if (lower.includes(app.name.toLowerCase())) return app.id;
  }
  return undefined;
}

function isFinanceRelated(body: string): boolean {
  const lower = body.toLowerCase();
  return FINANCE_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function readFinanceSms(days: number = 90): Promise<FinanceSms[]> {
  const minDate = Date.now() - days * 24 * 60 * 60 * 1000;

  const rawMessages: any[] = await readSmsRaw({
    box: "inbox",
    minDate,
    maxCount: 500,
  });

  const results: FinanceSms[] = [];

  for (const msg of rawMessages) {
    const body = msg.body || "";
    if (!isFinanceRelated(body)) continue;

    results.push({
      id: String(msg._id),
      address: msg.address || "",
      body,
      date: msg.date || 0,
      app: detectApp(body),
      amount: extractAmount(body),
      dueDate: extractDueDate(body),
      type: classifySms(body),
    });
  }

  return results.sort((a, b) => b.date - a.date);
}
