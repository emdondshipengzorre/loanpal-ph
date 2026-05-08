import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoanStore } from "../../src/store/loanStore";
import { AppPicker } from "../../src/components/common/AppPicker";
import { formatPHP, formatDate } from "../../src/lib/dates";
import { getLendingAppName } from "../../src/lib/lending-apps";
import { Payment } from "../../src/lib/types";
import { successFeedback } from "../../src/lib/haptics";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function LoanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loans = useLoanStore((s) => s.loans);
  const payments = useLoanStore((s) => s.payments);
  const addLoan = useLoanStore((s) => s.addLoan);
  const updateLoan = useLoanStore((s) => s.updateLoan);
  const deleteLoan = useLoanStore((s) => s.deleteLoan);
  const recordPayment = useLoanStore((s) => s.recordPayment);

  const isNew = id === "new";
  const loan = !isNew ? loans.find((l) => l.id === id) : undefined;
  const loanPayments = !isNew
    ? payments.filter((p) => p.loanId === id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const [mode, setMode] = useState<"view" | "edit" | "pay">(isNew ? "edit" : "view");

  const [app, setApp] = useState(loan?.app ?? "");
  const [customAppName, setCustomAppName] = useState(loan?.customAppName ?? "");
  const [amountBorrowed, setAmountBorrowed] = useState(loan ? String(loan.amountBorrowed) : "");
  const [remainingBalance, setRemainingBalance] = useState(
    loan ? String(loan.remainingBalance) : ""
  );
  const [monthlyPayment, setMonthlyPayment] = useState(loan ? String(loan.monthlyPayment) : "");
  const [nextDueDate, setNextDueDate] = useState(loan?.nextDueDate ?? "");

  const [payAmount, setPayAmount] = useState(loan ? String(loan.monthlyPayment) : "");
  const [payNote, setPayNote] = useState("");

  if (!isNew && !loan) {
    return (
      <View style={styles.container}>
        <Text style={typography.body}>Loan not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!app) {
      Alert.alert("Error", "Please select a lending app");
      return;
    }
    const borrowed = parseFloat(amountBorrowed.replace(/,/g, ""));
    const remaining = remainingBalance
      ? parseFloat(remainingBalance.replace(/,/g, ""))
      : borrowed;
    const monthly = parseFloat(monthlyPayment.replace(/,/g, ""));

    if (isNew) {
      await addLoan({
        app,
        customAppName: app === "Other" ? customAppName : undefined,
        amountBorrowed: borrowed,
        remainingBalance: remaining,
        monthlyPayment: monthly,
        nextDueDate: nextDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "active",
      });
      router.back();
    } else {
      await updateLoan(id!, {
        app,
        customAppName: app === "Other" ? customAppName : undefined,
        amountBorrowed: borrowed,
        remainingBalance: remaining,
        monthlyPayment: monthly,
        nextDueDate,
      });
      setMode("view");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Loan", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteLoan(id!);
          router.back();
        },
      },
    ]);
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(payAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) return;
    await recordPayment(id!, amount, payNote || undefined);
    successFeedback();
    setPayAmount(String(loan!.monthlyPayment));
    setPayNote("");
    setMode("view");
  };

  const handleMarkPaid = () => {
    Alert.alert("Mark as Paid", "Mark this loan as fully paid?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: async () => {
          await updateLoan(id!, { status: "paid", remainingBalance: 0 });
        },
      },
    ]);
  };

  const progress = loan
    ? ((loan.amountBorrowed - loan.remainingBalance) / loan.amountBorrowed) * 100
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={typography.h3}>{isNew ? "Add Loan" : "Loan Details"}</Text>
        {!isNew && mode === "view" && (
          <TouchableOpacity onPress={() => setMode("edit")}>
            <Ionicons name="create-outline" size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {(isNew || mode === "edit") && <View style={{ width: 24 }} />}
      </View>

      {mode === "view" && loan && (
        <>
          <View style={styles.card}>
            <Text style={typography.h2}>
              {getLendingAppName(loan.app, loan.customAppName)}
            </Text>
            {loan.status === "paid" && (
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>FULLY PAID</Text>
              </View>
            )}

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>
              {Math.round(progress)}% paid off
            </Text>

            <View style={styles.detailGrid}>
              <DetailRow label="Borrowed" value={formatPHP(loan.amountBorrowed)} />
              <DetailRow label="Remaining" value={formatPHP(loan.remainingBalance)} />
              <DetailRow label="Monthly" value={formatPHP(loan.monthlyPayment)} />
              <DetailRow label="Next Due" value={formatDate(loan.nextDueDate)} />
            </View>
          </View>

          {loan.status === "active" && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setPayAmount(String(loan.monthlyPayment));
                  setMode("pay");
                }}
              >
                <Ionicons name="cash-outline" size={20} color={colors.primaryForeground} />
                <Text style={styles.primaryButtonText}>Record Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineButton} onPress={handleMarkPaid}>
                <Text style={styles.outlineButtonText}>Mark Paid</Text>
              </TouchableOpacity>
            </View>
          )}

          {loanPayments.length > 0 && (
            <View style={styles.section}>
              <View style={styles.historyHeader}>
                <Text style={typography.h3}>Payment History</Text>
                <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                  Total: {formatPHP(loanPayments.reduce((s, p) => s + p.amount, 0))}
                </Text>
              </View>
              {loanPayments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </View>
          )}

          {!isNew && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              <Text style={[typography.label, { color: colors.destructive }]}>Delete Loan</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {mode === "pay" && loan && (
        <View style={styles.card}>
          <Text style={typography.h3}>Record Payment</Text>
          <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
            Remaining: {formatPHP(loan.remainingBalance)}
          </Text>

          <View style={styles.field}>
            <Text style={typography.label}>Amount (PHP)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              value={payNote}
              onChangeText={setPayNote}
              placeholder="e.g. partial payment"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRecordPayment}>
              <Text style={styles.primaryButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={() => setMode("view")}>
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(mode === "edit" || isNew) && (
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={typography.label}>Lending App</Text>
            <AppPicker value={app} onChange={setApp} />
          </View>

          {app === "Other" && (
            <View style={styles.field}>
              <Text style={typography.label}>App Name</Text>
              <TextInput
                style={styles.input}
                value={customAppName}
                onChangeText={setCustomAppName}
                placeholder="Enter app name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={typography.label}>Amount Borrowed (PHP)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amountBorrowed}
              onChangeText={setAmountBorrowed}
              placeholder="e.g. 10000"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>Remaining Balance (PHP)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={remainingBalance}
              onChangeText={setRemainingBalance}
              placeholder="Leave blank if same as borrowed"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>Monthly Payment (PHP)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={monthlyPayment}
              onChangeText={setMonthlyPayment}
              placeholder="e.g. 2500"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>Next Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={nextDueDate}
              onChangeText={setNextDueDate}
              placeholder="e.g. 2026-06-15"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>{isNew ? "Add Loan" : "Save Changes"}</Text>
            </TouchableOpacity>
            {!isNew && (
              <TouchableOpacity style={styles.outlineButton} onPress={() => setMode("view")}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[typography.caption, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={typography.label}>{value}</Text>
    </View>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <View style={styles.paymentRow}>
      <View>
        <Text style={typography.bodySmall}>{formatDate(payment.date)}</Text>
        {payment.note && (
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>
            {payment.note}
          </Text>
        )}
      </View>
      <Text style={typography.label}>{formatPHP(payment.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  paidBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  paidText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  progressBar: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    width: "47%",
    paddingVertical: spacing.xs,
  },
  actionRow: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    ...typography.button,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineButtonText: {
    ...typography.button,
    color: colors.foreground,
  },
  section: { marginTop: spacing.md },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  field: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.body,
    color: colors.foreground,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
});
