import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettingsStore } from "../../src/store/settingsStore";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function IncomeScreen() {
  const router = useRouter();
  const setMonthlyIncome = useSettingsStore((s) => s.setMonthlyIncome);
  const [income, setIncome] = useState("");

  const handleNext = async () => {
    const amount = parseFloat(income.replace(/,/g, ""));
    if (amount > 0) {
      await setMonthlyIncome(amount);
    }
    router.push("/(onboarding)/first-loan");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepActive} />
          <View style={styles.stepInactive} />
          <View style={styles.stepInactive} />
        </View>

        <Ionicons name="cash-outline" size={48} color={colors.primary} />
        <Text style={[typography.h2, { marginTop: spacing.md }]}>
          What's your monthly income?
        </Text>
        <Text style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.xs }]}>
          This helps us calculate your surplus and plan payments.
        </Text>

        <View style={styles.inputRow}>
          <Text style={styles.currency}>PHP</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            value={income}
            onChangeText={setIncome}
            autoFocus
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Text style={[typography.label, { color: colors.mutedForeground }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  stepIndicator: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  currency: {
    ...typography.h2,
    color: colors.mutedForeground,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.foreground,
    minWidth: 120,
    textAlign: "center",
  },
  buttons: {
    marginTop: spacing.xxl,
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
