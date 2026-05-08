import { useEffect } from "react";
import { View, Text, SectionList, StyleSheet } from "react-native";
import { useLoanStore } from "../../src/store/loanStore";
import { useBillStore } from "../../src/store/billStore";
import { formatPHP, getDaysUntilDate, getDaysUntilDue } from "../../src/lib/dates";
import { getLendingAppName } from "../../src/lib/lending-apps";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

interface PlannerItem {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  type: "loan" | "bill";
}

export default function PlannerScreen() {
  const loans = useLoanStore((s) => s.loans);
  const bills = useBillStore((s) => s.bills);
  const fetchLoans = useLoanStore((s) => s.fetchLoans);
  const fetchBills = useBillStore((s) => s.fetchBills);

  useEffect(() => {
    fetchLoans();
    fetchBills();
  }, []);

  const items: PlannerItem[] = [];

  for (const loan of loans.filter((l) => l.status === "active")) {
    const dueDay = new Date(loan.nextDueDate + "T00:00:00").getDate();
    items.push({
      id: loan.id,
      name: getLendingAppName(loan.app, loan.customAppName),
      amount: loan.monthlyPayment,
      dueDay,
      type: "loan",
    });
  }

  for (const bill of bills.filter((b) => b.status === "active")) {
    items.push({
      id: bill.id,
      name: bill.provider === "Other" ? bill.customProviderName || "Other" : bill.provider,
      amount: bill.typicalAmount,
      dueDay: bill.dueDay,
      type: "bill",
    });
  }

  const firstHalf = items.filter((i) => i.dueDay >= 1 && i.dueDay <= 15);
  const secondHalf = items.filter((i) => i.dueDay >= 16 && i.dueDay <= 31);

  firstHalf.sort((a, b) => a.dueDay - b.dueDay);
  secondHalf.sort((a, b) => a.dueDay - b.dueDay);

  const firstTotal = firstHalf.reduce((s, i) => s + i.amount, 0);
  const secondTotal = secondHalf.reduce((s, i) => s + i.amount, 0);

  const sections = [
    {
      title: `1st - 15th (${formatPHP(firstTotal)})`,
      data: firstHalf,
    },
    {
      title: `16th - 31st (${formatPHP(secondTotal)})`,
      data: secondHalf,
    },
  ];

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={typography.h3}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>{item.dueDay}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={typography.label}>{item.name}</Text>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>
              {item.type === "loan" ? "Loan" : "Bill"}
            </Text>
          </View>
          <Text style={typography.label}>{formatPHP(item.amount)}</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={[typography.body, { color: colors.mutedForeground }]}>
            No upcoming payments
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  sectionHeader: {
    backgroundColor: colors.muted,
    padding: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  dayText: { color: colors.primaryForeground, fontWeight: "700", fontSize: 14 },
  itemInfo: { flex: 1 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
});
