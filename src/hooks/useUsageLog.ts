import { useState, useCallback, useEffect } from "react";
import {
  startOfDay, startOfWeek, startOfMonth, startOfYear,
  endOfDay, endOfWeek, endOfMonth, endOfYear,
  isWithinInterval, format, subDays, eachDayOfInterval
} from "date-fns";

export interface UsageEntry {
  date: string; // ISO date string YYYY-MM-DD
  secondsUsed: number;
  profileId?: string | null;
}

const USAGE_KEY = "screen-timer-usage-log";

function loadLog(): UsageEntry[] {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(log: UsageEntry[]) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(log));
}

function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function useUsageLog(profileId?: string | null) {
  const [log, setLog] = useState<UsageEntry[]>(loadLog);

  useEffect(() => {
    saveLog(log);
  }, [log]);

  // Filter log entries for the active profile
  const profileLog = log.filter((e) => (e.profileId ?? null) === (profileId ?? null));

  const addUsage = useCallback((seconds: number) => {
    setLog((prev) => {
      const today = getTodayKey();
      const existing = prev.find(
        (e) => e.date === today && (e.profileId ?? null) === (profileId ?? null)
      );
      if (existing) {
        return prev.map((e) =>
          e.date === today && (e.profileId ?? null) === (profileId ?? null)
            ? { ...e, secondsUsed: e.secondsUsed + seconds }
            : e
        );
      }
      return [...prev, { date: today, secondsUsed: seconds, profileId: profileId ?? null }];
    });
  }, [profileId]);

  const getTotal = useCallback(
    (period: "day" | "week" | "month" | "year") => {
      const now = new Date();
      let start: Date, end: Date;
      switch (period) {
        case "day":
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case "week":
          start = startOfWeek(now, { weekStartsOn: 1 });
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "month":
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case "year":
          start = startOfYear(now);
          end = endOfYear(now);
          break;
      }
      return profileLog
        .filter((e) => {
          const d = new Date(e.date + "T12:00:00");
          return isWithinInterval(d, { start, end });
        })
        .reduce((sum, e) => sum + e.secondsUsed, 0);
    },
    [profileLog]
  );

  const getDailyData = useCallback(
    (days: number) => {
      const now = new Date();
      const interval = eachDayOfInterval({
        start: subDays(now, days - 1),
        end: now,
      });
      return interval.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        const entry = profileLog.find((e) => e.date === key);
        return {
          date: format(d, "EEE"),
          fullDate: key,
          seconds: entry?.secondsUsed ?? 0,
          hours: Number(((entry?.secondsUsed ?? 0) / 3600).toFixed(1)),
        };
      });
    },
    [profileLog]
  );

  const setLogBulk = useCallback((entries: UsageEntry[]) => {
    setLog(entries);
  }, []);

  return { log, profileLog, addUsage, getTotal, getDailyData, setLogBulk };
}
