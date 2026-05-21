import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  FinanceSms,
  readFinanceSms,
  requestSmsPermission,
  hasSmsPermission,
} from "../src/lib/sms";
import { getLendingAppName } from "../src/lib/lending-apps";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, borderRadius } from "../src/theme/spacing";

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  loan: { icon: "wallet-outline", color: colors.primary, label: "Loan" },
  bill: { icon: "receipt-outline", color: "#f59e0b", label: "Bill" },
  payment: { icon: "checkmark-circle-outline", color: "#22c55e", label: "Payment" },
  reminder: { icon: "alarm-outline", color: "#ef4444", label: "Reminder" },
  promo: { icon: "megaphone-outline", color: colors.mutedForeground, label: "Promo" },
};

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatAmount(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type FilterType = "all" | "loan" | "bill" | "payment" | "reminder";

export default function SmsScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<FinanceSms[]>([]);
  const [loading, setLoading] = useState(true);
  const [permitted, setPermitted] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const sms = await readFinanceSms(90);
      setMessages(sms);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to read SMS");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      let ok = await hasSmsPermission();
      if (!ok) ok = await requestSmsPermission();
      setPermitted(ok);
      if (ok) loadMessages();
      else setLoading(false);
    })();
  }, [loadMessages]);

  const filtered = filter === "all" ? messages.filter((m) => m.type !== "promo") : messages.filter((m) => m.type === filter);

  const counts = {
    all: messages.filter((m) => m.type !== "promo").length,
    loan: messages.filter((m) => m.type === "loan").length,
    bill: messages.filter((m) => m.type === "bill").length,
    payment: messages.filter((m) => m.type === "payment").length,
    reminder: messages.filter((m) => m.type === "reminder").length,
  };

  if (!permitted && !loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="mail-unread-outline" size={64} color={colors.mutedForeground} />
        <Text style={styles.emptyTitle}>SMS Permission Required</Text>
        <Text style={styles.emptySubtitle}>
          LoanPal needs SMS access to find loan and bill reminders from your messages.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            const ok = await requestSmsPermission();
            setPermitted(ok);
            if (ok) loadMessages();
          }}
        >
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Finance SMS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterRow}>
        {(["all", "loan", "bill", "payment", "reminder"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : TYPE_CONFIG[f].label} ({counts[f]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMessages} />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centered}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No finance SMS found</Text>
              <Text style={styles.emptySubtitle}>
                Messages about loans, bills, and payments will appear here.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.loan;
          const expanded = expandedId === item.id;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setExpandedId(expanded ? null : item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBadge, { backgroundColor: config.color + "20" }]}>
                  <Ionicons name={config.icon as any} size={18} color={config.color} />
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.sender} numberOfLines={1}>
                    {item.app ? getLendingAppName(item.app) : item.address}
                  </Text>
                  <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
                {item.amount != null && (
                  <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
                )}
              </View>

              {item.dueDate && (
                <View style={styles.dueDateRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
                  <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
                </View>
              )}

              <Text style={[styles.body, !expanded && styles.bodyCollapsed]} numberOfLines={expanded ? undefined : 2}>
                {item.body}
              </Text>

              <View style={styles.chipRow}>
                <View style={[styles.typeChip, { backgroundColor: config.color + "20" }]}>
                  <Text style={[styles.typeChipText, { color: config.color }]}>{config.label}</Text>
                </View>
                {item.app && (
                  <View style={styles.appChip}>
                    <Text style={styles.appChipText}>{getLendingAppName(item.app)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h3, color: colors.foreground },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { ...typography.caption, color: colors.mutedForeground },
  filterTextActive: { color: "#fff" },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: { flex: 1 },
  sender: { ...typography.bodyBold, color: colors.foreground },
  date: { ...typography.caption, color: colors.mutedForeground },
  amount: { ...typography.bodyBold, color: colors.primary },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  dueDateText: { ...typography.caption, color: colors.mutedForeground },
  body: { ...typography.body, color: colors.foreground, marginTop: spacing.xs },
  bodyCollapsed: { lineHeight: 20 },
  chipRow: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  typeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  typeChipText: { ...typography.caption, fontWeight: "600" },
  appChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.muted,
  },
  appChipText: { ...typography.caption, color: colors.foreground },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyContainer: { flex: 1 },
  emptyTitle: { ...typography.h3, color: colors.foreground, marginTop: spacing.md },
  emptySubtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  primaryButtonText: { ...typography.bodyBold, color: "#fff" },
});
