import { useState, useCallback } from "react";

export interface NotificationSettings {
  phoneNumber: string;
  twilioFromNumber: string;
  smsEnabled: boolean;
  warnAt5Min: boolean;
  warnAt1Min: boolean;
  notifyAtZero: boolean;
}

const STORAGE_KEY = "screen-timer-notif-settings";

const defaults: NotificationSettings = {
  phoneNumber: "",
  twilioFromNumber: "",
  smsEnabled: false,
  warnAt5Min: true,
  warnAt1Min: true,
  notifyAtZero: true,
};

function load(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function save(settings: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(load);

  const update = useCallback((partial: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  return { settings, update };
}
