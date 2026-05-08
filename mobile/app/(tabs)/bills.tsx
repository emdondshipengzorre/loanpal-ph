import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBillStore } from "../../src/store/billStore";
import { formatPHP, getDaysUntilDue, ordinalSuffix, getCurrentPeriod } from "../../src/lib/dates";
import { Bill, BILL_CATEGORY_LABELS } from "../../src/lib/types";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function BillsScreen() {
  const router = useRouter();
  const bills = useBillStore((s) => s.bills);
  const billPayments = useBillStore((s) => s.billPayments);
  const fetchBills = useBillStore((s) => s.fetchBills);
  const fetchBillPayments = useBillStore((s) => s.fetchBillPayments);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchBillPayments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBills(), fetchBillPayments()]);
    setRefreshing(false);
  };

  const activeBills = bills.filter((b) => b.status === "active");
  const totalMonthly = activeBills.reduce((s, b) => s + b.typicalAmount, 0);

  const currentPeriod = getCurrentPeriod();
  const paidBillIds = new Set(
    billPayments.filter((p) => p.period === currentPeriod).map((p) => p.billId)
  );

  const renderBill = ({ item }: { item: Bill }) => {
    const isPaid = paidBillIds.has(item.id);
    const daysUntil = getDaysUntilDue(item.dueDay);

    return (
      <TouchableOpacity
        style={styles.billCard}
        onPress={() => router.push(`/bill/${item.id}`)}
      >
        <View style={styles.billHeader}>
          <View>
            <Text style={typography.label}>
              {item.provider === "Other" ? item.customProviderName || "Other" : item.provider}
            </Text>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>
              {BILL_CATEGORY_LABELS[item.category]} | Every {ordinalSuffix(item.dueDay)}
            </Text>
          </View>
          {isPaid ? (
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark" size={14} color="#fff" />
              <Text style={styles.paidText}>Paid</Text>
            </View>
          ) : (
            <Text
              style={[
                typography.caption,
                { color: daysUntil < 0 ? colors.destructive : colors.mutedForeground },
              ]}
            >
              {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d`}
            </Text>
          )}
        </View>
        <Text style={typography.body}>{formatPHP(item.typicalAmount)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>Monthly Bills</Text>
          <Text style={typography.h3}>{formatPHP(totalMonthly)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>
            Paid This Month
          </Text>
          <Text style={typography.h3}>
            {activeBills.filter((b) => paidBillIds.has(b.id)).length}/{activeBills.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={activeBills}
        keyExtractor={(item) => item.id}
        renderItem={renderBill}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.mutedForeground} />
            <Text
              style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.sm }]}
            >
              No bills yet
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/bill/new")}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summary: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: { padding: spacing.md, paddingBottom: 100 },
  billCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  paidText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
