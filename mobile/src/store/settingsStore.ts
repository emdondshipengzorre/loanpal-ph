import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  monthlyIncome: number;
  onboardingComplete: boolean;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;

  loadSettings: () => Promise<void>;
  setMonthlyIncome: (amount: number) => Promise<void>;
  setOnboardingComplete: () => Promise<void>;
  setBiometrics: (enabled: boolean) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
}

const KEYS = {
  income: "loanpal-monthly-income",
  onboarding: "loanpal-onboarding-complete",
  biometrics: "loanpal-biometrics",
  notifications: "loanpal-notifications",
};

export const useSettingsStore = create<SettingsState>((set) => ({
  monthlyIncome: 0,
  onboardingComplete: false,
  biometricsEnabled: false,
  notificationsEnabled: true,

  loadSettings: async () => {
    const [income, onboarding, biometrics, notifications] = await Promise.all([
      AsyncStorage.getItem(KEYS.income),
      AsyncStorage.getItem(KEYS.onboarding),
      AsyncStorage.getItem(KEYS.biometrics),
      AsyncStorage.getItem(KEYS.notifications),
    ]);
    set({
      monthlyIncome: income ? Number(income) : 0,
      onboardingComplete: onboarding === "true",
      biometricsEnabled: biometrics === "true",
      notificationsEnabled: notifications !== "false",
    });
  },

  setMonthlyIncome: async (amount) => {
    await AsyncStorage.setItem(KEYS.income, String(amount));
    set({ monthlyIncome: amount });
  },

  setOnboardingComplete: async () => {
    await AsyncStorage.setItem(KEYS.onboarding, "true");
    set({ onboardingComplete: true });
  },

  setBiometrics: async (enabled) => {
    await AsyncStorage.setItem(KEYS.biometrics, String(enabled));
    set({ biometricsEnabled: enabled });
  },

  setNotifications: async (enabled) => {
    await AsyncStorage.setItem(KEYS.notifications, String(enabled));
    set({ notificationsEnabled: enabled });
  },
}));
