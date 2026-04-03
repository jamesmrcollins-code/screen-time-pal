import { useState, useCallback, useEffect } from "react";

export interface ScheduleSettings {
  useSchedule: boolean;
  weekdayLimitSeconds: number;
  weekendLimitSeconds: number;
}

const SCHEDULE_KEY = "screen-timer-schedule";

const defaultSchedule: ScheduleSettings = {
  useSchedule: false,
  weekdayLimitSeconds: 3600,
  weekendLimitSeconds: 7200,
};

function load(profileId: string | null): ScheduleSettings {
  try {
    const key = profileId ? `${SCHEDULE_KEY}-${profileId}` : SCHEDULE_KEY;
    const raw = localStorage.getItem(key);
    return raw ? { ...defaultSchedule, ...JSON.parse(raw) } : defaultSchedule;
  } catch {
    return defaultSchedule;
  }
}

function save(settings: ScheduleSettings, profileId: string | null) {
  const key = profileId ? `${SCHEDULE_KEY}-${profileId}` : SCHEDULE_KEY;
  localStorage.setItem(key, JSON.stringify(settings));
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function isWeekendDate(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function useSchedule(profileId: string | null = null) {
  const [settings, setSettings] = useState<ScheduleSettings>(() => load(profileId));

  useEffect(() => { setSettings(load(profileId)); }, [profileId]);
  useEffect(() => { save(settings, profileId); }, [settings, profileId]);

  const update = useCallback((partial: Partial<ScheduleSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const getTodayLimit = useCallback((): number | null => {
    if (!settings.useSchedule) return null;
    return isWeekend() ? settings.weekendLimitSeconds : settings.weekdayLimitSeconds;
  }, [settings]);

  const setFromCloud = useCallback((cloudData: ScheduleSettings) => {
    setSettings({ ...defaultSchedule, ...cloudData });
  }, []);

  return { settings, update, getTodayLimit, setScheduleFromCloud: setFromCloud };
}
