"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loan, Bill } from "@/lib/types";
import { formatPHP } from "@/lib/dates";
import { getLendingAppName } from "@/lib/lending-apps";
import { getMonthlyIncome, setMonthlyIncome } from "@/lib/storage";

interface FinancialOverviewProps {
  loans: Loan[];
  bills: Bill[];
}

function Bar({
  label,
  amount,
  max,
  color,
}: {
  label: string;
  amount: number;
  max: number;
  color: string;
}) {
  const width = max > 0 ? Math.min((amount / max) * 100, 100) : 0;
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatPHP(amount)}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function FinancialOverview({ loans, bills }: FinancialOverviewProps) {
  const [income, setIncome] = useState(0);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");

  useEffect(() => {
    const saved = getMonthlyIncome();
    setIncome(saved);
    setIncomeInput(saved > 0 ? String(saved) : "");
  }, []);

  function handleSaveIncome() {
    const val = parseFloat(incomeInput) || 0;
    setMonthlyIncome(val);
    setIncome(val);
    setEditingIncome(false);
  }

  const activeLoans = loans.filter((l) => l.status === "active");
  const activeBills = bills.filter((b) => b.status === "active");

  const totalLoanPayments = activeLoans.reduce(
    (s, l) => s + l.monthlyPayment,
    0
  );
  const totalBillPayments = activeBills.reduce(
    (s, b) => s + b.typicalAmount,
    0
  );
  const totalObligations = totalLoanPayments + totalBillPayments;
  const surplus = income - totalObligations;
  const totalDebt = activeLoans.reduce((s, l) => s + l.remainingBalance, 0);

  const monthsToDebtFree =
    totalLoanPayments > 0 ? Math.ceil(totalDebt / totalLoanPayments) : 0;
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + monthsToDebtFree);
  const debtFreeDateStr =
    monthsToDebtFree > 0
      ? debtFreeDate.toLocaleDateString("en-PH", {
          month: "short",
          year: "numeric",
        })
      : "No active loans";

  const barMax = Math.max(income, totalObligations, 1);

  return (
    <div className="grid gap-4">
      {/* Income card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Monthly income
              </p>
              {!editingIncome && (
                <p className="text-xl font-bold sm:text-2xl">
                  {income > 0 ? formatPHP(income) : "Not set"}
                </p>
              )}
            </div>
            {!editingIncome && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIncomeInput(income > 0 ? String(income) : "");
                  setEditingIncome(true);
                }}
              >
                {income > 0 ? "Edit" : "Set income"}
              </Button>
            )}
          </div>
          {editingIncome && (
            <div className="mt-3 flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="e.g. 25000"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveIncome}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingIncome(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash flow breakdown */}
      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <p className="text-sm font-semibold">Cash Flow</p>
          {income > 0 && (
            <Bar
              label="Income"
              amount={income}
              max={barMax}
              color="bg-green-500"
            />
          )}
          <Bar
            label="Loan payments"
            amount={totalLoanPayments}
            max={barMax}
            color="bg-blue-500"
          />
          <Bar
            label="Bills"
            amount={totalBillPayments}
            max={barMax}
            color="bg-amber-500"
          />
          <Bar
            label="Total obligations"
            amount={totalObligations}
            max={barMax}
            color="bg-destructive"
          />
          {income > 0 && (
            <div className="mt-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {surplus >= 0 ? "Remaining after bills" : "Shortfall"}
                </span>
                <span
                  className={`text-lg font-bold ${
                    surplus >= 0 ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {surplus >= 0 ? formatPHP(surplus) : `-${formatPHP(Math.abs(surplus))}`}
                </span>
              </div>
              {income > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((totalObligations / income) * 100)}% of income
                  goes to obligations
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Total debt
          </p>
          <p className="text-lg font-bold sm:text-xl">
            {formatPHP(totalDebt)}
          </p>
        </div>
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Debt-free by
          </p>
          <p className="text-lg font-bold sm:text-xl">{debtFreeDateStr}</p>
        </div>
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Active loans
          </p>
          <p className="text-lg font-bold sm:text-xl">
            {activeLoans.length}
          </p>
        </div>
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Active bills
          </p>
          <p className="text-lg font-bold sm:text-xl">
            {activeBills.length}
          </p>
        </div>
      </div>

      {/* Debt breakdown by app */}
      {activeLoans.length > 0 && (
        <Card>
          <CardContent className="grid gap-3 p-4 sm:p-6">
            <p className="text-sm font-semibold">Debt by App</p>
            {activeLoans
              .sort((a, b) => b.remainingBalance - a.remainingBalance)
              .map((loan) => {
                const name = getLendingAppName(loan.app, loan.customAppName);
                return (
                  <Bar
                    key={loan.id}
                    label={name}
                    amount={loan.remainingBalance}
                    max={totalDebt}
                    color="bg-primary"
                  />
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
