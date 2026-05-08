import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoanStore } from "../src/store/loanStore";
import { calculateSnowball, calculateAvalanche, PayoffResult } from "../src/lib/payoff";
import { formatPHP } from "../src/lib/dates";
import { getLendingAppName } from "../src/lib/lending-apps";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, borderRadius } from "../src/theme/spacing";

export default function PayoffScreen() {
  const router = useRouter();
  const loans = useLoanStore((s) => s.loans);
  const activeLoans = loans.filter((l) => l.status === "active" && l.remainingBalance > 0);

  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("snowball");
  const [extraBudget, setExtraBudget] = useState("");

  const extra = parseFloat(extraBudget.replace(/,/g, "")) || 0;

  const result: PayoffResult = useMemo(() => {
    return strategy === "snowball"
      ? calculateSnowball(loans, extra)
      : calculateAvalanche(loans, extra);
  }, [loans, strategy, extra]);

  const paidOffOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: { name: string; month: number }[] = [];
    for (const step of result.steps) {
      if (step.paidOff && !seen.has(step.loanId)) {
        seen.add(step.loanId);
        const loan = loans.find((l) => l.id === step.loanId);
        order.push({
          name: loan ? getLendingAppName(loan.app, loan.customAppName) : step.loanName,
          month: step.month,
        });
      }
    }
    return order;
  }, [result]);

  if (activeLoans.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={typography.h3}>Debt Payoff Strategy</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
          <Text style={[typography.h3, { marginTop: spacing.md }]}>No active debt!</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={typography.h3}>Debt Payoff Strategy</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, strategy === "snowball" && styles.toggleActive]}
          onPress={() => setStrategy("snowball")}
        >
          <Text
            style={[
              typography.label,
              strategy === "snowball" && { color: colors.primaryForeground },
            ]}
          >
            Snowball
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, strategy === "avalanche" && styles.toggleActive]}
          onPress={() => setStrategy("avalanche")}
        >
          <Text
            style={[
              typography.label,
              strategy === "avalanche" && { color: colors.primaryForeground },
            ]}
          >
            Avalanche
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[typography.caption, { color: colors.mutedForeground, marginBottom: spacing.md }]}>
        {strategy === "snowball"
          ? "Pay smallest balance first. Quick wins keep you motivated."
          : "Pay highest cost loans first. Saves the most money overall."}
      </Text>

      <View style={styles.field}>
        <Text style={typography.label}>Extra monthly budget (PHP)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={extraBudget}
          onChangeText={setExtraBudget}
          placeholder="0 (optional)"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      <View style={styles.resultCard}>
        <View style={styles.resultRow}>
          <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
            Debt-free in
          </Text>
          <Text style={typography.h2}>
            {result.totalMonths} month{result.totalMonths !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>Total paid</Text>
          <Text style={typography.h3}>{formatPHP(result.totalPaid)}</Text>
        </View>
      </View>

      {paidOffOrder.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Payoff Order</Text>
          {paidOffOrder.map((item, i) => (
            <View key={i} style={styles.orderRow}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderNumber}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={typography.label}>{item.name}</Text>
                <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                  Paid off in month {item.month}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {result.monthlyBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Debt Over Time</Text>
          <View style={styles.chartContainer}>
            {result.monthlyBreakdown
              .filter((_, i) => i % Math.max(1, Math.floor(result.monthlyBreakdown.length / 12)) === 0 || i === result.monthlyBreakdown.length - 1)
              .map((m) => {
                const maxRemaining = result.monthlyBreakdown[0]?.totalRemaining || 1;
                const height = Math.max(4, (m.totalRemaining / maxRemaining) * 120);
                return (
                  <View key={m.month} style={styles.barCol}>
                    <View style={[styles.bar, { height }]} />
                    <Text style={styles.barLabel}>{m.month}</Text>
                  </View>
                );
              })}
          </View>
          <Text style={[typography.caption, { color: colors.mutedForeground, textAlign: "center" }]}>
            Month
          </Text>
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  field: { marginBottom: spacing.md, gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.body,
    color: colors.foreground,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  section: { marginTop: spacing.md },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  orderNumber: {
    color: colors.primaryForeground,
    fontWeight: "700",
    fontSize: 13,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 140,
    paddingTop: spacing.md,
  },
  barCol: { alignItems: "center", flex: 1 },
  bar: {
    width: 16,
    backgroundColor: colors.primary,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 4,
    fontSize: 9,
  },
});
