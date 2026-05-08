import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertItem } from "./alerts";
import { formatPHP, formatDate, ordinalSuffix } from "./dates";

const NOTIFIED_KEY = "loanpal-notified";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleAlertNotifications(alerts: AlertItem[]) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  for (const alert of alerts) {
    if (await wasRecentlyNotified(alert.id)) continue;

    const { title, body } = buildContent(alert);
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
    await markAsNotified(alert.id);
  }
}

export async function scheduleDueDateReminder(
  itemId: string,
  name: string,
  amount: number,
  dueDate: string
) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const due = new Date(dueDate + "T09:00:00");
  const reminderDate = new Date(due.getTime() - 24 * 60 * 60 * 1000);

  if (reminderDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Payment due tomorrow: ${name}`,
      body: `${formatPHP(amount)} due on ${formatDate(dueDate)}`,
      sound: true,
    },
    trigger: { date: reminderDate, type: Notifications.SchedulableTriggerInputTypes.DATE },
    identifier: `reminder-${itemId}`,
  });
}

export async function cancelReminder(itemId: string) {
  await Notifications.cancelScheduledNotificationAsync(`reminder-${itemId}`);
}

function buildContent(alert: AlertItem): { title: string; body: string } {
  const prefix = alert.urgency === "overdue" ? "Overdue" : "Due soon";
  const title = `${prefix}: ${alert.name}`;

  if (alert.type === "loan") {
    if (alert.urgency === "overdue") {
      return {
        title,
        body: `${formatPHP(alert.amount)} was due ${formatDate(alert.dueDate)}. Pay now to avoid penalties!`,
      };
    }
    return {
      title,
      body: `${formatPHP(alert.amount)} due in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""} on ${formatDate(alert.dueDate)}`,
    };
  }

  const dueDay = new Date(alert.dueDate + "T00:00:00").getDate();
  if (alert.urgency === "overdue") {
    return {
      title,
      body: `~${formatPHP(alert.amount)} was due on the ${ordinalSuffix(dueDay)}. Pay now!`,
    };
  }
  return {
    title,
    body: `~${formatPHP(alert.amount)} due in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""} (every ${ordinalSuffix(dueDay)})`,
  };
}

async function getNotifiedMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function wasRecentlyNotified(itemId: string): Promise<boolean> {
  const map = await getNotifiedMap();
  const last = map[itemId];
  if (!last) return false;
  return Date.now() - new Date(last).getTime() < COOLDOWN_MS;
}

async function markAsNotified(itemId: string) {
  const map = await getNotifiedMap();
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const cleaned: Record<string, string> = {};
  for (const [key, val] of Object.entries(map)) {
    if (new Date(val).getTime() > cutoff) cleaned[key] = val;
  }
  cleaned[itemId] = new Date().toISOString();
  await AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify(cleaned));
}
