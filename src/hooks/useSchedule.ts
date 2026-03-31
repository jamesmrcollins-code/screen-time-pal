import { useState, useCallback, useEffect } from "react";

export interface DaySchedule {
  enabled: boolean;
  limitSeconds: number;
}

export interface ScheduleSettings {
  useSchedule: boolean;
  days: Record<string, DaySchedule>; // mon, tue, wed, thu, fri, sat, sun
}

const SCHEDULE_KEY = "screen-timer-schedule";
const DAY_NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

const defaultSchedule: ScheduleSettings = {
  useSchedule: false,
  days: Object.fromEntries(
    DAY_NAMES.map((d) => [d, { enabled: true, limitSeconds: 3600 }])
  ),
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

function getCurrentDayKey(): string {
  const jsDay = new Date().getDay(); // 0=Sun
  return DAY_NAMES[jsDay === 0 ? 6 : jsDay - 1];
}

export function useSchedule(profileId: string | null = null) {
  const [settings, setSettings] = useState<ScheduleSettings>(() => load(profileId));

  useEffect(() => { setSettings(load(profileId)); }, [profileId]);
  useEffect(() => { save(settings, profileId); }, [settings, profileId]);

  const update = useCallback((partial: Partial<ScheduleSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateDay = useCallback((day: string, partial: Partial<DaySchedule>) => {
    setSettings((prev) => ({
      ...prev,
      days: { ...prev.days, [day]: { ...prev.days[day], ...partial } },
    }));
  }, []);

  const getTodayLimit = useCallback((): number | null => {
    if (!settings.useSchedule) return null;
    const today = getCurrentDayKey();
    const daySettings = settings.days[today];
    if (!daySettings?.enabled) return null;
    return daySettings.limitSeconds;
  }, [settings]);

  return { settings, update, updateDay, getTodayLimit, DAY_NAMES, DAY_LABELS };
}

export { DAY_NAMES, DAY_LABELS };
