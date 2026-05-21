import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBillStore } from "../../src/store/billStore";
import { formatPHP, formatDate, ordinalSuffix, getCurrentPeriod } from "../../src/lib/dates";
import {
  Bill,
  BillPayment,
  BILL_CATEGORIES,
  BILL_CATEGORY_LABELS,
  BILL_PROVIDERS,
  BillCategory,
} from "../../src/lib/types";
import { successFeedback } from "../../src/lib/haptics";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function BillDetailScreen() {
  const router = useRouter();
  const { id, prefillCategory, prefillProvider, prefillAmount, prefillDueDay } =
    useLocalSearchParams<{
      id: string;
      prefillCategory?: string;
      prefillProvider?: string;
      prefillAmount?: string;
      prefillDueDay?: string;
    }>();
  const bills = useBillStore((s) => s.bills);
  const billPayments = useBillStore((s) => s.billPayments);
  const addBill = useBillStore((s) => s.addBill);
  const updateBill = useBillStore((s) => s.updateBill);
  const deleteBill = useBillStore((s) => s.deleteBill);
  const recordBillPayment = useBillStore((s) => s.recordBillPayment);

  const isNew = id === "new";
  const bill = !isNew ? bills.find((b) => b.id === id) : undefined;
  const payments = !isNew
    ? billPayments.filter((p) => p.billId === id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const currentPeriod = getCurrentPeriod();
  const isPaidThisMonth = payments.some((p) => p.period === currentPeriod);

  const [mode, setMode] = useState<"view" | "edit" | "pay">(isNew ? "edit" : "view");

  const [category, setCategory] = useState<BillCategory | "">(
    bill?.category ?? (prefillCategory as BillCategory) ?? ""
  );
  const [provider, setProvider] = useState(bill?.provider ?? prefillProvider ?? "");
  const [customProviderName, setCustomProviderName] = useState(bill?.customProviderName ?? "");
  const [typicalAmount, setTypicalAmount] = useState(
    bill ? String(bill.typicalAmount) : prefillAmount ?? ""
  );
  const [dueDay, setDueDay] = useState(
    bill ? String(bill.dueDay) : prefillDueDay ?? ""
  );
  const [notes, setNotes] = useState(bill?.notes ?? "");

  const [payAmount, setPayAmount] = useState(bill ? String(bill.typicalAmount) : "");
  const [payNote, setPayNote] = useState("");

  if (!isNew && !bill) {
    return (
      <View style={styles.container}>
        <Text style={typography.body}>Bill not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!category || !provider) {
      Alert.alert("Error", "Please select category and provider");
      return;
    }
    const amount = parseFloat(typicalAmount.replace(/,/g, ""));
    const day = Math.min(31, Math.max(1, parseInt(dueDay) || 1));

    if (isNew) {
      await addBill({
        category: category as BillCategory,
        provider,
        customProviderName: provider === "Other" ? customProviderName : undefined,
        typicalAmount: amount,
        dueDay: day,
        status: "active",
        notes: notes || undefined,
      });
      router.back();
    } else {
      await updateBill(id!, {
        category: category as BillCategory,
        provider,
        customProviderName: provider === "Other" ? customProviderName : undefined,
        typicalAmount: amount,
        dueDay: day,
        notes: notes || undefined,
      });
      setMode("view");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Bill", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteBill(id!);
          router.back();
        },
      },
    ]);
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(payAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) return;
    await recordBillPayment(id!, amount, currentPeriod, payNote || undefined);
    successFeedback();
    setPayAmount(String(bill!.typicalAmount));
    setPayNote("");
    setMode("view");
  };

  const handleTogglePause = async () => {
    const newStatus = bill!.status === "active" ? "paused" : "active";
    await updateBill(id!, { status: newStatus });
  };

  const displayName =
    bill?.provider === "Other" ? bill?.customProviderName || "Other" : bill?.provider;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={typography.h3}>{isNew ? "Add Bill" : "Bill Details"}</Text>
        {!isNew && mode === "view" ? (
          <TouchableOpacity onPress={() => setMode("edit")}>
            <Ionicons name="create-outline" size={24} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {mode === "view" && bill && (
        <>
          <View style={styles.card}>
            <Text style={typography.h2}>{displayName}</Text>
            <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
              {BILL_CATEGORY_LABELS[bill.category]} | Due every {ordinalSuffix(bill.dueDay)}
            </Text>

            <View style={styles.amountRow}>
              <Text style={[typography.h1, { marginTop: spacing.md }]}>
                {formatPHP(bill.typicalAmount)}
              </Text>
              {isPaidThisMonth ? (
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text style={styles.paidText}>Paid</Text>
                </View>
              ) : (
                <View style={styles.unpaidBadge}>
                  <Text style={styles.unpaidText}>Unpaid</Text>
                </View>
              )}
            </View>

            {bill.status === "paused" && (
              <View style={styles.pausedBadge}>
                <Text style={styles.pausedText}>PAUSED</Text>
              </View>
            )}
          </View>

          {bill.status === "active" && !isPaidThisMonth && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setPayAmount(String(bill.typicalAmount));
                setMode("pay");
              }}
            >
              <Ionicons name="cash-outline" size={20} color={colors.primaryForeground} />
              <Text style={styles.primaryButtonText}>Record Payment</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.outlineButton} onPress={handleTogglePause}>
            <Text style={styles.outlineButtonText}>
              {bill.status === "active" ? "Pause Bill" : "Resume Bill"}
            </Text>
          </TouchableOpacity>

          {payments.length > 0 && (
            <View style={styles.section}>
              <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Payment History</Text>
              {payments.map((p) => (
                <View key={p.id} style={styles.paymentRow}>
                  <View>
                    <Text style={typography.bodySmall}>{formatDate(p.date)}</Text>
                    <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                      {p.period}
                      {p.note ? ` — ${p.note}` : ""}
                    </Text>
                  </View>
                  <Text style={typography.label}>{formatPHP(p.amount)}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
            <Text style={[typography.label, { color: colors.destructive }]}>Delete Bill</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === "pay" && bill && (
        <View style={styles.card}>
          <Text style={typography.h3}>Record Payment — {displayName}</Text>
          <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
            Period: {currentPeriod}
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
              placeholder="e.g. paid via GCash"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <TouchableOpacity style={[styles.primaryButton, { marginTop: spacing.md }]} onPress={handleRecordPayment}>
            <Text style={styles.primaryButtonText}>Confirm Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => setMode("view")}>
            <Text style={styles.outlineButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {(mode === "edit" || isNew) && (
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={typography.label}>Category</Text>
            <View style={styles.chipGrid}>
              {BILL_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipSelected]}
                  onPress={() => {
                    setCategory(cat);
                    setProvider("");
                  }}
                >
                  <Text
                    style={[
                      typography.bodySmall,
                      category === cat && { color: colors.primaryForeground },
                    ]}
                  >
                    {BILL_CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {category !== "" && (
            <View style={styles.field}>
              <Text style={typography.label}>Provider</Text>
              <View style={styles.chipGrid}>
                {BILL_PROVIDERS[category as BillCategory].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, provider === p && styles.chipSelected]}
                    onPress={() => setProvider(p)}
                  >
                    <Text
                      style={[
                        typography.bodySmall,
                        provider === p && { color: colors.primaryForeground },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {provider === "Other" && (
            <View style={styles.field}>
              <Text style={typography.label}>Provider Name</Text>
              <TextInput
                style={styles.input}
                value={customProviderName}
                onChangeText={setCustomProviderName}
                placeholder="Enter provider name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={typography.label}>Typical Amount (PHP)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={typicalAmount}
              onChangeText={setTypicalAmount}
              placeholder="e.g. 3000"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>Due Day (1-31)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dueDay}
              onChangeText={setDueDay}
              placeholder="e.g. 15"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any notes"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <TouchableOpacity style={[styles.primaryButton, { marginTop: spacing.md }]} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>{isNew ? "Add Bill" : "Save Changes"}</Text>
          </TouchableOpacity>
          {!isNew && (
            <TouchableOpacity style={styles.outlineButton} onPress={() => setMode("view")}>
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
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
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  paidText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  unpaidBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  unpaidText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  pausedBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  pausedText: { color: colors.mutedForeground, fontSize: 11, fontWeight: "700" },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: colors.primaryForeground, ...typography.button },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  outlineButtonText: { ...typography.button, color: colors.foreground },
  section: { marginTop: spacing.md },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  field: { marginTop: spacing.md, gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.body,
    color: colors.foreground,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
