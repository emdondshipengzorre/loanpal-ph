import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoanStore } from "../../src/store/loanStore";
import { POPULAR_APP_IDS, getLendingAppName } from "../../src/lib/lending-apps";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function FirstLoanScreen() {
  const router = useRouter();
  const addLoan = useLoanStore((s) => s.addLoan);
  const [selectedApp, setSelectedApp] = useState("");
  const [amount, setAmount] = useState("");
  const [monthly, setMonthly] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = async () => {
    if (!selectedApp || !amount || !monthly) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const amountNum = parseFloat(amount.replace(/,/g, ""));
    const monthlyNum = parseFloat(monthly.replace(/,/g, ""));
    const dueDateStr = dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

    await addLoan({
      app: selectedApp,
      amountBorrowed: amountNum,
      remainingBalance: amountNum,
      monthlyPayment: monthlyNum,
      nextDueDate: dueDateStr,
      status: "active",
    });
    router.push("/(onboarding)/first-bill");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.stepIndicator}>
        <View style={styles.stepDone} />
        <View style={styles.stepActive} />
        <View style={styles.stepInactive} />
      </View>

      <Ionicons name="wallet-outline" size={48} color={colors.primary} />
      <Text style={[typography.h2, { marginTop: spacing.md, textAlign: "center" }]}>
        Add your first loan
      </Text>
      <Text style={[typography.body, { color: colors.mutedForeground, textAlign: "center" }]}>
        Pick a lending app and enter the details.
      </Text>

      <Text style={[typography.label, { marginTop: spacing.lg }]}>Popular Apps</Text>
      <View style={styles.appGrid}>
        {POPULAR_APP_IDS.map((id) => (
          <TouchableOpacity
            key={id}
            style={[styles.appChip, selectedApp === id && styles.appChipSelected]}
            onPress={() => setSelectedApp(id)}
          >
            <Text
              style={[
                typography.bodySmall,
                selectedApp === id && { color: colors.primaryForeground },
              ]}
            >
              {getLendingAppName(id)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.appChip, selectedApp === "Other" && styles.appChipSelected]}
          onPress={() => setSelectedApp("Other")}
        >
          <Text
            style={[
              typography.bodySmall,
              selectedApp === "Other" && { color: colors.primaryForeground },
            ]}
          >
            Other
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={typography.label}>Amount Borrowed (PHP)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10000"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={typography.label}>Monthly Payment (PHP)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2500"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={monthly}
          onChangeText={setMonthly}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={typography.label}>Next Due Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-06-15"
          placeholderTextColor={colors.mutedForeground}
          value={dueDate}
          onChangeText={setDueDate}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
          <Text style={styles.primaryButtonText}>Add Loan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(onboarding)/first-bill")}>
          <Text style={[typography.label, { color: colors.mutedForeground }]}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    padding: spacing.lg,
    alignItems: "center",
    paddingBottom: spacing.xxl,
  },
  stepIndicator: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  stepDone: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.success,
  },
  stepActive: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  stepInactive: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  appGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: "100%",
  },
  appChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  fieldGroup: {
    width: "100%",
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
  buttons: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    ...typography.button,
  },
});
