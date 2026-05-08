import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing } from "../src/theme/spacing";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={typography.h2}>Page not found</Text>
        <Link href="/" style={styles.link}>
          <Text style={[typography.label, { color: "#2e78b7" }]}>Go to home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  link: { marginTop: spacing.md, paddingVertical: spacing.md },
});
