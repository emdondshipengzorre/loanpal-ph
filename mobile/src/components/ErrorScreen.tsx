import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";

interface Props {
  error: Error;
  retry: () => void;
}

export function ErrorScreen({ error, retry }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={64} color={colors.warning} />
      <Text style={[typography.h3, { marginTop: spacing.md }]}>Something went wrong</Text>
      <Text
        style={[
          typography.bodySmall,
          { color: colors.mutedForeground, marginTop: spacing.sm, textAlign: "center" },
        ]}
      >
        {error.message || "An unexpected error occurred."}
      </Text>
      <TouchableOpacity style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.primaryForeground,
    ...typography.button,
  },
});
