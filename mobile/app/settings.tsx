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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { isBiometricsAvailable, authenticate } from "../src/lib/biometrics";
import { getQueue, processQueue } from "../src/lib/sync-queue";
import { lightTap } from "../src/lib/haptics";
import { supabase } from "../src/lib/supabase";
import { formatPHP } from "../src/lib/dates";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, borderRadius } from "../src/theme/spacing";

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const {
    monthlyIncome,
    biometricsEnabled,
    notificationsEnabled,
    setMonthlyIncome,
    setBiometrics,
    setNotifications,
  } = useSettingsStore();

  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(monthlyIncome || ""));
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  const handleToggleBiometrics = async () => {
    if (!biometricsEnabled) {
      const available = await isBiometricsAvailable();
      if (!available) {
        Alert.alert("Not Available", "Biometric authentication is not set up on this device.");
        return;
      }
      const success = await authenticate();
      if (!success) return;
    }
    lightTap();
    setBiometrics(!biometricsEnabled);
  };

  const handleSaveIncome = async () => {
    const amount = parseFloat(incomeInput.replace(/,/g, "")) || 0;
    await setMonthlyIncome(amount);
    setEditingIncome(false);
  };

  const handleCheckSync = async () => {
    const queue = await getQueue();
    setPendingCount(queue.length);
    if (queue.length === 0) {
      Alert.alert("All Synced", "No pending offline changes.");
    } else {
      Alert.alert(
        `${queue.length} Pending`,
        "Attempt to sync now?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sync Now",
            onPress: async () => {
              const result = await processQueue();
              Alert.alert(
                "Sync Complete",
                `Synced: ${result.processed}, Failed: ${result.failed}`
              );
              setPendingCount(result.failed);
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                await supabase.from("payments").delete().eq("user_id", user.id);
                await supabase.from("bill_payments").delete().eq("user_id", user.id);
                await supabase.from("loans").delete().eq("user_id", user.id);
                await supabase.from("bills").delete().eq("user_id", user.id);
              }
              await signOut();
              router.replace("/(auth)/login");
            } catch {
              Alert.alert("Error", "Could not delete account. Try again later.");
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={typography.h3}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.section}>
        <Text style={[typography.caption, styles.sectionLabel]}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <Ionicons name="person-circle-outline" size={36} color={colors.mutedForeground} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={typography.label}>{user?.email || user?.phone || "Guest User"}</Text>
              <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                {user ? "Signed in" : "Not signed in"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.caption, styles.sectionLabel]}>MONTHLY INCOME</Text>
        <View style={styles.card}>
          {editingIncome ? (
            <View style={styles.incomeEdit}>
              <TextInput
                style={styles.incomeInput}
                keyboardType="numeric"
                value={incomeInput}
                onChangeText={setIncomeInput}
                placeholder="Enter monthly income"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
              <View style={styles.incomeActions}>
                <TouchableOpacity onPress={() => setEditingIncome(false)}>
                  <Text style={[typography.label, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveIncome}>
                  <Text style={[typography.label, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.incomeDisplay}
              onPress={() => {
                setIncomeInput(String(monthlyIncome || ""));
                setEditingIncome(true);
              }}
            >
              <View>
                <Text style={typography.label}>
                  {monthlyIncome > 0 ? formatPHP(monthlyIncome) : "Not set"}
                </Text>
                <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                  Tap to edit
                </Text>
              </View>
              <Ionicons name="pencil-outline" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.caption, styles.sectionLabel]}>PREFERENCES</Text>
        <SettingRow
          icon="notifications-outline"
          label="Push Notifications"
          subtitle="Due date reminders and alerts"
          enabled={notificationsEnabled}
          onToggle={() => {
            lightTap();
            setNotifications(!notificationsEnabled);
          }}
        />
        <SettingRow
          icon="finger-print"
          label="Biometric Lock"
          subtitle="Require Face ID / fingerprint"
          enabled={biometricsEnabled}
          onToggle={handleToggleBiometrics}
        />
      </View>

      <View style={styles.section}>
        <Text style={[typography.caption, styles.sectionLabel]}>DATA</Text>
        <TouchableOpacity style={styles.settingRow} onPress={handleCheckSync}>
          <Ionicons name="cloud-outline" size={20} color={colors.foreground} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={typography.body}>Sync Status</Text>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>
              {pendingCount === null
                ? "Tap to check"
                : pendingCount === 0
                  ? "All synced"
                  : `${pendingCount} pending`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[typography.button, { color: colors.destructive, marginLeft: spacing.sm }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, { marginTop: spacing.sm, borderColor: colors.border }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          <Text style={[typography.button, { color: colors.destructive, marginLeft: spacing.sm }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[
          typography.caption,
          { color: colors.mutedForeground, textAlign: "center", marginTop: spacing.xl },
        ]}
      >
        LoanPal PH v1.0.0
      </Text>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  label,
  subtitle,
  enabled,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onToggle}>
      <Ionicons name={icon} size={20} color={colors.foreground} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={typography.body}>{label}</Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>{subtitle}</Text>
        )}
      </View>
      <View style={[styles.toggle, enabled && styles.toggleActive]}>
        <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]} />
      </View>
    </TouchableOpacity>
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
  section: { marginTop: spacing.lg },
  sectionLabel: {
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  incomeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  incomeEdit: {
    gap: spacing.sm,
  },
  incomeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    ...typography.body,
    color: colors.foreground,
  },
  incomeActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleThumbActive: { alignSelf: "flex-end" },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: borderRadius.md,
  },
});
