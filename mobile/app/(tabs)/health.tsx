import { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useLoanStore } from "../../src/store/loanStore";
import { useBillStore } from "../../src/store/billStore";
import { computeHealthScore, ScoreBreakdown } from "../../src/lib/health-score";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function HealthScreen() {
  const loans = useLoanStore((s) => s.loans);
  const payments = useLoanStore((s) => s.payments);
  const bills = useBillStore((s) => s.bills);
  const billPayments = useBillStore((s) => s.billPayments);
  const fetchLoans = useLoanStore((s) => s.fetchLoans);
  const fetchPayments = useLoanStore((s) => s.fetchPayments);
  const fetchBills = useBillStore((s) => s.fetchBills);
  const fetchBillPayments = useBillStore((s) => s.fetchBillPayments);

  useEffect(() => {
    fetchLoans();
    fetchPayments();
    fetchBills();
    fetchBillPayments();
  }, []);

  const health = computeHealthScore(loans, payments, bills, billPayments);

  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (health.score / 100) * circumference;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.scoreContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.muted}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={health.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.scoreOverlay}>
          <Text style={[styles.scoreNumber, { color: health.color }]}>{health.score}</Text>
          <Text style={[typography.label, { color: health.color }]}>{health.grade}</Text>
        </View>
      </View>

      <Text style={[typography.h3, styles.breakdownTitle]}>Score Breakdown</Text>

      {health.breakdown.map((item) => (
        <BreakdownRow key={item.label} item={item} />
      ))}
    </ScrollView>
  );
}

function BreakdownRow({ item }: { item: ScoreBreakdown }) {
  const percentage = (item.points / item.maxPoints) * 100;

  return (
    <View style={styles.breakdownCard}>
      <View style={styles.breakdownHeader}>
        <Text style={typography.label}>{item.label}</Text>
        <Text style={typography.label}>
          {item.points}/{item.maxPoints}
        </Text>
      </View>
      <View style={styles.breakdownBar}>
        <View style={[styles.breakdownFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={[typography.caption, { color: colors.mutedForeground }]}>{item.detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, alignItems: "center", paddingBottom: spacing.xxl },
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.lg,
  },
  scoreOverlay: {
    position: "absolute",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "700",
  },
  breakdownTitle: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  breakdownCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  breakdownBar: {
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  breakdownFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
});
