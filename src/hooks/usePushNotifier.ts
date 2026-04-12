import { useRef, useCallback, useState } from "react";

const STORAGE_KEY = "screen-timer-push-settings";

export interface PushSettings {
  warnAt5Min: boolean;
  warnAt1Min: boolean;
  notifyAtZero: boolean;
}

const defaults: PushSettings = {
  warnAt5Min: true,
  warnAt1Min: true,
  notifyAtZero: true,
};

function load(): PushSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function save(settings: PushSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function sendPush(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
}

const THRESHOLDS = {
  fiveMin: 5 * 60,
  oneMin: 60,
  zero: 0,
} as const;

export function usePushNotifier() {
  const [settings, setSettings] = useState<PushSettings>(load);
  const sentRef = useRef<Set<string>>(new Set());

  const updateSettings = useCallback((partial: Partial<PushSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  const resetSent = useCallback(() => {
    sentRef.current.clear();
  }, []);

  const check = useCallback(
    (remainingSeconds: number) => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      if (settings.warnAt5Min && remainingSeconds === THRESHOLDS.fiveMin && !sentRef.current.has("5min")) {
        sentRef.current.add("5min");
        sendPush("⏰ 5 Minutes Left", "Only 5 minutes of screen time remaining!");
      }
      if (settings.warnAt1Min && remainingSeconds === THRESHOLDS.oneMin && !sentRef.current.has("1min")) {
        sentRef.current.add("1min");
        sendPush("⚠️ 1 Minute Left", "Only 1 minute of screen time remaining!");
      }
      if (settings.notifyAtZero && remainingSeconds === THRESHOLDS.zero && !sentRef.current.has("zero")) {
        sentRef.current.add("zero");
        sendPush("🛑 Time's Up!", "Screen time is up!");
      }
    },
    [settings]
  );

  return { settings, updateSettings, check, resetSent };
}
