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
import { useBillStore } from "../../src/store/billStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { BILL_CATEGORIES, BILL_CATEGORY_LABELS, BILL_PROVIDERS, BillCategory } from "../../src/lib/types";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function FirstBillScreen() {
  const router = useRouter();
  const addBill = useBillStore((s) => s.addBill);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [category, setCategory] = useState<BillCategory | "">("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");

  const handleFinish = async () => {
    if (category && provider && amount) {
      const amountNum = parseFloat(amount.replace(/,/g, ""));
      const dueDayNum = parseInt(dueDay) || 1;
      await addBill({
        category: category as BillCategory,
        provider,
        typicalAmount: amountNum,
        dueDay: Math.min(31, Math.max(1, dueDayNum)),
        status: "active",
      });
    }
    await setOnboardingComplete();
    router.replace("/(tabs)");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.stepIndicator}>
        <View style={styles.stepDone} />
        <View style={styles.stepDone} />
        <View style={styles.stepActive} />
      </View>

      <Ionicons name="receipt-outline" size={48} color={colors.primary} />
      <Text style={[typography.h2, { marginTop: spacing.md, textAlign: "center" }]}>
        Add your first bill
      </Text>
      <Text style={[typography.body, { color: colors.mutedForeground, textAlign: "center" }]}>
        Track recurring expenses like utilities and subscriptions.
      </Text>

      <Text style={[typography.label, { marginTop: spacing.lg, alignSelf: "flex-start" }]}>
        Category
      </Text>
      <View style={styles.chipGrid}>
        {BILL_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipSelected]}
            onPress={() => {
              setCategory(cat);
              setProvider("");
            }}
          >
            <Text
              style={[
                typography.bodySmall,
                category === cat && { color: colors.primaryForeground },
              ]}
            >
              {BILL_CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {category !== "" && (
        <>
          <Text style={[typography.label, { marginTop: spacing.md, alignSelf: "flex-start" }]}>
            Provider
          </Text>
          <View style={styles.chipGrid}>
            {BILL_PROVIDERS[category as BillCategory].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, provider === p && styles.chipSelected]}
                onPress={() => setProvider(p)}
              >
                <Text
                  style={[
                    typography.bodySmall,
                    provider === p && { color: colors.primaryForeground },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.fieldGroup}>
        <Text style={typography.label}>Typical Amount (PHP)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 3000"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={typography.label}>Due Day of Month (1-31)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 15"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={dueDay}
          onChangeText={setDueDay}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
          <Text style={styles.primaryButtonText}>
            {category && provider && amount ? "Add Bill & Get Started" : "Get Started"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={[typography.label, { color: colors.mutedForeground }]}>Skip</Text>
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: "100%",
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
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
