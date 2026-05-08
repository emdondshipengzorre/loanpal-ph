import * as Calendar from "expo-calendar";
import { Platform, Linking } from "react-native";
import { formatPHP } from "./dates";

export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  const writable = calendars.filter((c) => c.allowsModifications);
  if (writable.length === 0) return null;

  const primary = writable.find((c) => c.isPrimary);
  return primary?.id ?? writable[0].id;
}

export async function addPaymentToCalendar(opts: {
  title: string;
  amount: number;
  dueDate: string;
  recurring?: boolean;
}): Promise<boolean> {
  const hasPermission = await requestCalendarPermissions();
  if (!hasPermission) return false;

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) return false;

  const startDate = new Date(opts.dueDate + "T09:00:00");
  const endDate = new Date(opts.dueDate + "T09:30:00");

  const eventDetails: Partial<Calendar.Event> = {
    title: opts.title,
    notes: `Monthly payment of ${formatPHP(opts.amount)}`,
    startDate,
    endDate,
    calendarId,
    alarms: [{ relativeOffset: -1440 }, { relativeOffset: -60 }],
    timeZone: "Asia/Manila",
  };

  if (opts.recurring) {
    eventDetails.recurrenceRule = {
      frequency: Calendar.Frequency.MONTHLY,
      occurrence: 12,
    } as Calendar.RecurrenceRule;
  }

  await Calendar.createEventAsync(calendarId, eventDetails as Calendar.Event);
  return true;
}

export function openGCash() {
  Linking.openURL("https://gcash.com").catch(() => {
    Linking.openURL("https://play.google.com/store/apps/details?id=com.globe.gcash.android");
  });
}

export function openMaya() {
  Linking.openURL("https://maya.ph").catch(() => {
    Linking.openURL("https://play.google.com/store/apps/details?id=com.paymaya");
  });
}
