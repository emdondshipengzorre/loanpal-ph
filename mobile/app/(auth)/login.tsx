import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/authStore";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithPhone, signInWithGoogle, loading } = useAuthStore();
  const [phone, setPhone] = useState("");

  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    try {
      const formatted = phone.startsWith("+") ? phone : `+63${phone.replace(/^0/, "")}`;
      await signInWithPhone(formatted);
      router.push({ pathname: "/(auth)/otp-verify", params: { phone: formatted } });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Google sign-in failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Ionicons name="wallet" size={64} color={colors.primary} />
          <Text style={[typography.h1, { marginTop: spacing.md }]}>LoanPal PH</Text>
          <Text style={[typography.body, { color: colors.mutedForeground }]}>
            Manage your loans and bills
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={typography.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+63</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="9XX XXX XXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handlePhoneLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Sending..." : "Continue with Phone"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={20} color={colors.foreground} />
            <Text style={[typography.button, { marginLeft: spacing.sm }]}>
              Continue with Google
            </Text>
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
    justifyContent: "center",
    padding: spacing.lg,
  },
  logo: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  form: { gap: spacing.md },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  prefix: {
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.mutedForeground,
    backgroundColor: colors.muted,
    lineHeight: 48,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.body,
    color: colors.foreground,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    ...typography.button,
  },
  disabledButton: { opacity: 0.6 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
  },
});
