import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoanStore } from "../../src/store/loanStore";
import { useBillStore } from "../../src/store/billStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { computeAlerts, AlertItem } from "../../src/lib/alerts";
import { formatPHP, formatDate, getDaysUntilDate } from "../../src/lib/dates";
import { getLendingAppName } from "../../src/lib/lending-apps";
import { scheduleAlertNotifications, scheduleAllReminders } from "../../src/lib/notifications";
import { exportPaymentHistory } from "../../src/lib/export";
import { openGCash, openMaya } from "../../src/lib/calendar";
import { successFeedback, lightTap } from "../../src/lib/haptics";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";
import { useState, useCallback } from "react";

export default function OverviewScreen() {
  const router = useRouter();
  const loans = useLoanStore((s) => s.loans);
  const payments = useLoanStore((s) => s.payments);
  const bills = useBillStore((s) => s.bills);
  const billPayments = useBillStore((s) => s.billPayments);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const fetchLoans = useLoanStore((s) => s.fetchLoans);
  const fetchPayments = useLoanStore((s) => s.fetchPayments);
  const fetchBills = useBillStore((s) => s.fetchBills);
  const fetchBillPayments = useBillStore((s) => s.fetchBillPayments);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLoans();
    fetchPayments();
    fetchBills();
    fetchBillPayments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchLoans(), fetchPayments(), fetchBills(), fetchBillPayments()]);
    setRefreshing(false);
  }, []);

  const activeLoans = loans.filter((l) => l.status === "active");
  const activeBills = bills.filter((b) => b.status === "active");
  const totalLoanPayments = activeLoans.reduce((s, l) => s + l.monthlyPayment, 0);
  const totalBillPayments = activeBills.reduce((s, b) => s + b.typicalAmount, 0);
  const totalRemaining = activeLoans.reduce((s, l) => s + l.remainingBalance, 0);
  const surplus = monthlyIncome - totalLoanPayments - totalBillPayments;

  const alerts = computeAlerts(loans, bills, billPayments);

  useEffect(() => {
    if (alerts.length > 0) {
      scheduleAlertNotifications(alerts);
    }
    scheduleAllReminders(loans, bills);
  }, [alerts.length, loans.length, bills.length]);

  const handleExport = async () => {
    await exportPaymentHistory(loans, payments, bills, billPayments);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={typography.h2}>LoanPal PH</Text>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>Due Soon</Text>
          {alerts.map((alert) => (
            <QuickPayCard key={alert.id} alert={alert} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>Monthly Summary</Text>
        <View style={styles.card}>
          {monthlyIncome > 0 && (
            <SummaryRow label="Monthly Income" value={formatPHP(monthlyIncome)} />
          )}
          <SummaryRow label="Loan Payments" value={formatPHP(totalLoanPayments)} />
          <SummaryRow label="Bill Payments" value={formatPHP(totalBillPayments)} />
          {monthlyIncome > 0 && (
            <SummaryRow
              label={surplus >= 0 ? "Surplus" : "Shortfall"}
              value={formatPHP(Math.abs(surplus))}
              highlight={surplus >= 0 ? colors.success : colors.destructive}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>Debt Overview</Text>
        <View style={styles.card}>
          <SummaryRow label="Active Loans" value={String(activeLoans.length)} />
          <SummaryRow label="Total Remaining" value={formatPHP(totalRemaining)} />
          <SummaryRow label="Active Bills" value={String(activeBills.length)} />
        </View>
      </View>

      {(loans.length > 0 || bills.length > 0) && (
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/payoff")}
            >
              <Ionicons name="trending-down-outline" size={22} color={colors.primary} />
              <Text style={styles.actionLabel}>Payoff Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              <Text style={styles.actionLabel}>Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={openGCash}>
              <Ionicons name="wallet-outline" size={22} color={colors.primary} />
              <Text style={styles.actionLabel}>GCash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={openMaya}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
              <Text style={styles.actionLabel}>Maya</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/sms")}
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
              <Text style={styles.actionLabel}>SMS Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loans.length === 0 && bills.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.sm }]}>
            Add your first loan or bill to get started
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function QuickPayCard({ alert }: { alert: AlertItem }) {
  const recordPayment = useLoanStore((s) => s.recordPayment);
  const recordBillPayment = useBillStore((s) => s.recordBillPayment);

  const urgencyColor =
    alert.daysUntil < 0
      ? colors.urgency.overdue
      : alert.daysUntil === 0
        ? colors.urgency.dueToday
        : colors.urgency.dueSoon;

  const label =
    alert.daysUntil < 0
      ? `${Math.abs(alert.daysUntil)}d overdue`
      : alert.daysUntil === 0
        ? "Due today"
        : `${alert.daysUntil}d left`;

  const handlePay = async () => {
    if (alert.type === "loan") {
      await recordPayment(alert.id, alert.amount);
    } else {
      const period = new Date().toISOString().slice(0, 7);
      await recordBillPayment(alert.id, alert.amount, period);
    }
    successFeedback();
  };

  return (
    <View style={[styles.quickPayCard, { borderLeftColor: urgencyColor }]}>
      <View style={styles.quickPayInfo}>
        <Text style={typography.label}>{alert.name}</Text>
        <Text style={[typography.caption, { color: urgencyColor }]}>{label}</Text>
        <Text style={typography.bodySmall}>{formatPHP(alert.amount)}</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payButtonText}>Pay</Text>
      </TouchableOpacity>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[typography.label, highlight ? { color: highlight } : undefined]}>{value}</Text>
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
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  quickPayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  quickPayInfo: { flex: 1 },
  payButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  payButtonText: {
    color: colors.primaryForeground,
    ...typography.button,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
});
