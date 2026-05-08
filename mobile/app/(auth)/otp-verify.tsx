import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, borderRadius } from "../../src/theme/spacing";

export default function OtpVerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, loading } = useAuthStore();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d.length === 1)) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    try {
      await verifyOtp(phone!, code);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Invalid OTP");
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Verify your number</Text>
      <Text style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.sm }]}>
        Enter the 6-digit code sent to {phone}
      </Text>

      <View style={styles.otpRow}>
        {digits.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputs.current[i] = ref; }}
            style={[styles.otpInput, digit ? styles.otpFilled : null]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            editable={!loading}
            autoFocus={i === 0}
          />
        ))}
      </View>

      {loading && (
        <Text style={[typography.body, { color: colors.mutedForeground, textAlign: "center" }]}>
          Verifying...
        </Text>
      )}

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={[typography.label, { color: colors.mutedForeground }]}>
          Change phone number
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginVertical: spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: colors.foreground,
  },
  otpFilled: {
    borderColor: colors.primary,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
});
