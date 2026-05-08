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
import { useLoanStore } from "../../src/store/loanStore";
import { formatPHP, formatDate, getDaysUntilDate } from "../../src/lib/dates";
import { getLendingAppName } from "../../src/lib/lending-apps";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";
import { Loan } from "../../src/lib/types";

export default function LoansScreen() {
  const router = useRouter();
  const loans = useLoanStore((s) => s.loans);
  const fetchLoans = useLoanStore((s) => s.fetchLoans);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  const activeLoans = loans.filter((l) => l.status === "active");
  const paidLoans = loans.filter((l) => l.status === "paid");
  const totalRemaining = activeLoans.reduce((s, l) => s + l.remainingBalance, 0);
  const totalMonthly = activeLoans.reduce((s, l) => s + l.monthlyPayment, 0);

  const renderLoan = ({ item }: { item: Loan }) => {
    const daysUntil = getDaysUntilDate(item.nextDueDate);
    const progress =
      item.amountBorrowed > 0
        ? ((item.amountBorrowed - item.remainingBalance) / item.amountBorrowed) * 100
        : 0;

    return (
      <TouchableOpacity
        style={styles.loanCard}
        onPress={() => router.push(`/loan/${item.id}`)}
      >
        <View style={styles.loanHeader}>
          <Text style={typography.label}>
            {getLendingAppName(item.app, item.customAppName)}
          </Text>
          {item.status === "paid" ? (
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>PAID</Text>
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

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        <Text style={[typography.caption, { color: colors.mutedForeground }]}>
          {Math.round(progress)}% paid off
        </Text>

        <View style={styles.loanDetails}>
          <View>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>Remaining</Text>
            <Text style={typography.label}>{formatPHP(item.remainingBalance)}</Text>
          </View>
          <View>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>Monthly</Text>
            <Text style={typography.label}>{formatPHP(item.monthlyPayment)}</Text>
          </View>
          <View>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>Due</Text>
            <Text style={typography.label}>{formatDate(item.nextDueDate)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>
            Total Remaining
          </Text>
          <Text style={typography.h3}>{formatPHP(totalRemaining)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>
            Monthly Total
          </Text>
          <Text style={typography.h3}>{formatPHP(totalMonthly)}</Text>
        </View>
      </View>

      <FlatList
        data={[...activeLoans, ...paidLoans]}
        keyExtractor={(item) => item.id}
        renderItem={renderLoan}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.mutedForeground} />
            <Text
              style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.sm }]}
            >
              No loans yet
            </Text>
          </View>
        }
      />

      <View style={styles.fabGroup}>
        <TouchableOpacity
          style={styles.fabSecondary}
          onPress={() => router.push("/scan")}
        >
          <Ionicons name="camera-outline" size={22} color={colors.primaryForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/loan/new")}
        >
          <Ionicons name="add" size={28} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
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
  loanCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  paidBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  paidText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  progressBar: {
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.full,
    marginBottom: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  loanDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  fabGroup: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  fabSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  fab: {
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
