"use client";

import { useState, useEffect, useCallback } from "react";

const PREF_KEY = "loanpal-notifications-enabled";

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    const pref = localStorage.getItem(PREF_KEY);
    const browserPerm =
      "Notification" in window ? Notification.permission : "unsupported";
    setPermission(browserPerm as NotificationPermission | "unsupported");
    setEnabled(pref === "true" && browserPerm === "granted");
  }, []);

  const toggle = useCallback(async () => {
    if (enabled) {
      localStorage.setItem(PREF_KEY, "false");
      setEnabled(false);
      return;
    }
    if ("Notification" in window && Notification.permission !== "granted") {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
    }
    localStorage.setItem(PREF_KEY, "true");
    setEnabled(true);
  }, [enabled]);

  return { enabled, permission, toggle };
}
