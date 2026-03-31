import { useState, useCallback } from "react";

export interface LockScreenSettings {
  lockOnZero: boolean;
  alarmOnZero: boolean;
}

const STORAGE_KEY = "screen-timer-lock-settings";

const defaults: LockScreenSettings = {
  lockOnZero: false,
  alarmOnZero: false,
};

function load(): LockScreenSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function save(s: LockScreenSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useLockScreenSettings() {
  const [settings, setSettings] = useState<LockScreenSettings>(load);

  const update = useCallback((partial: Partial<LockScreenSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  return { settings, update };
}
