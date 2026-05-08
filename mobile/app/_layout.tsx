import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useAuthStore } from "../src/store/authStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { authenticate, isBiometricsAvailable } from "../src/lib/biometrics";
import { startSyncListener } from "../src/lib/sync-queue";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const biometricsEnabled = useSettingsStore((s) => s.biometricsEnabled);
  const [locked, setLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    Promise.all([initialize(), loadSettings()]).then(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    const unsubscribe = startSyncListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!biometricsEnabled) return;

    const sub = AppState.addEventListener("change", async (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        const available = await isBiometricsAvailable();
        if (available) {
          setLocked(true);
          const success = await authenticate();
          setLocked(!success);
        }
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [biometricsEnabled]);

  if (!initialized || locked) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="loan/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="bill/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="scan" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="payoff" options={{ presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
