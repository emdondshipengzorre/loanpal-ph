import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Loan, Payment, Bill, BillPayment } from "./types";
import { formatPHP, formatDate } from "./dates";
import { getLendingAppName } from "./lending-apps";

export async function exportPaymentHistory(
  loans: Loan[],
  payments: Payment[],
  bills: Bill[],
  billPayments: BillPayment[]
): Promise<void> {
  const html = buildHtml(loans, payments, bills, billPayments);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Payment History",
      UTI: "com.adobe.pdf",
    });
  }
}

function buildHtml(
  loans: Loan[],
  payments: Payment[],
  bills: Bill[],
  billPayments: BillPayment[]
): string {
  const now = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const loanRows = payments
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => {
      const loan = loans.find((l) => l.id === p.loanId);
      const name = loan ? getLendingAppName(loan.app, loan.customAppName) : "Unknown";
      return `<tr>
        <td>${formatDate(p.date)}</td>
        <td>${name}</td>
        <td style="text-align:right">${formatPHP(p.amount)}</td>
        <td>${p.note || ""}</td>
      </tr>`;
    })
    .join("");

  const billRows = billPayments
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => {
      const bill = bills.find((b) => b.id === p.billId);
      const name = bill
        ? bill.provider === "Other"
          ? bill.customProviderName || "Other"
          : bill.provider
        : "Unknown";
      return `<tr>
        <td>${formatDate(p.date)}</td>
        <td>${name}</td>
        <td>${p.period}</td>
        <td style="text-align:right">${formatPHP(p.amount)}</td>
      </tr>`;
    })
    .join("");

  const totalLoanPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalBillPaid = billPayments.reduce((s, p) => s + p.amount, 0);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; padding: 20px; font-size: 12px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-top: 24px; color: #333; }
    .date { color: #666; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; border-bottom: 2px solid #333; padding: 6px 4px; font-size: 11px; }
    td { border-bottom: 1px solid #eee; padding: 6px 4px; }
    .total { font-weight: bold; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>LoanPal PH — Payment History</h1>
  <p class="date">Generated ${now}</p>

  <h2>Loan Payments</h2>
  ${payments.length > 0 ? `
  <table>
    <tr><th>Date</th><th>Loan</th><th style="text-align:right">Amount</th><th>Note</th></tr>
    ${loanRows}
  </table>
  <p class="total">Total loan payments: ${formatPHP(totalLoanPaid)}</p>
  ` : "<p>No loan payments recorded.</p>"}

  <h2>Bill Payments</h2>
  ${billPayments.length > 0 ? `
  <table>
    <tr><th>Date</th><th>Provider</th><th>Period</th><th style="text-align:right">Amount</th></tr>
    ${billRows}
  </table>
  <p class="total">Total bill payments: ${formatPHP(totalBillPaid)}</p>
  ` : "<p>No bill payments recorded.</p>"}

  <p class="total" style="margin-top:24px">Grand total: ${formatPHP(totalLoanPaid + totalBillPaid)}</p>
</body>
</html>`;
}
