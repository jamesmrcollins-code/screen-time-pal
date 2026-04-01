import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import type { UsageEntry } from "@/hooks/useUsageLog";
import type { ScheduleSettings } from "@/hooks/useSchedule";

export interface RewardsData {
  currentStreak: number;
  longestStreak: number;
  totalStars: number;
  todayUnderLimit: boolean;
}

const REWARDS_KEY = "screen-timer-rewards";
const DAY_NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface StoredRewards {
  datesUnderLimit: string[]; // YYYY-MM-DD
  lastCheckedDate: string; // last date we evaluated
}

function load(profileId: string | null): StoredRewards {
  try {
    const key = profileId ? `${REWARDS_KEY}-${profileId}` : REWARDS_KEY;
    const raw = localStorage.getItem(key);
    return raw
      ? JSON.parse(raw)
      : { datesUnderLimit: [], lastCheckedDate: "" };
  } catch {
    return { datesUnderLimit: [], lastCheckedDate: "" };
  }
}

function save(data: StoredRewards, profileId: string | null) {
  const key = profileId ? `${REWARDS_KEY}-${profileId}` : REWARDS_KEY;
  localStorage.setItem(key, JSON.stringify(data));
}

function getDayKey(date: Date): string {
  const jsDay = date.getDay(); // 0=Sun
  return DAY_NAMES[jsDay === 0 ? 6 : jsDay - 1];
}

/**
 * Check unchecked past days and mark them as under-limit or not.
 * Called on app open / hook mount.
 */
function evaluatePastDays(
  stored: StoredRewards,
  usageLog: UsageEntry[],
  schedule: ScheduleSettings
): StoredRewards {
  const today = format(new Date(), "yyyy-MM-dd");
  const lastChecked = stored.lastCheckedDate;

  // Only check days we haven't evaluated yet (up to yesterday — today is still in progress)
  const newDatesUnderLimit = [...stored.datesUnderLimit];
  const usageMap = new Map(usageLog.map((e) => [e.date, e.secondsUsed]));

  // Go back up to 90 days to catch any gaps
  for (let i = 1; i <= 90; i++) {
    const d = subDays(new Date(), i);
    const dateStr = format(d, "yyyy-MM-dd");

    // Already evaluated this day or before our last check
    if (newDatesUnderLimit.includes(dateStr)) continue;
    if (lastChecked && dateStr <= lastChecked) break;

    const dayKey = getDayKey(d);
    const daySchedule = schedule.days[dayKey];

    if (!schedule.useSchedule || !daySchedule?.enabled) {
      // Free day — auto-pass
      newDatesUnderLimit.push(dateStr);
    } else {
      // Check usage against limit
      const used = usageMap.get(dateStr) ?? 0;
      if (used <= daySchedule.limitSeconds) {
        newDatesUnderLimit.push(dateStr);
      }
      // If over limit, don't add — streak will break naturally
    }
  }

  return {
    datesUnderLimit: newDatesUnderLimit,
    lastCheckedDate: today,
  };
}

function calcStreak(dates: string[]): { current: number; longest: number } {
  const set = new Set(dates);
  let current = 0;
  let longest = 0;
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const day = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (set.has(day)) {
      streak++;
      longest = Math.max(longest, streak);
      current = streak; // keeps updating as long as streak is unbroken
    } else {
      if (i === 0) continue; // today still in progress, skip
      break; // streak broken — stop counting current
    }
  }

  // Also scan full history for longest
  let fullStreak = 0;
  for (let i = 0; i < 365; i++) {
    const day = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (set.has(day)) {
      fullStreak++;
      longest = Math.max(longest, fullStreak);
    } else {
      if (i === 0) continue;
      fullStreak = 0;
    }
  }

  return { current, longest };
}

export function useRewards(
  profileId: string | null = null,
  usageLog: UsageEntry[] = [],
  schedule: ScheduleSettings | null = null
) {
  const [data, setData] = useState<StoredRewards>(() => load(profileId));

  // Reload when profile changes
  useEffect(() => {
    setData(load(profileId));
  }, [profileId]);

  // Auto-evaluate past days on mount / when dependencies change
  useEffect(() => {
    if (!schedule) return;
    setData((prev) => {
      const updated = evaluatePastDays(prev, usageLog, schedule);
      // Only update if something actually changed
      if (
        updated.datesUnderLimit.length !== prev.datesUnderLimit.length ||
        updated.lastCheckedDate !== prev.lastCheckedDate
      ) {
        return updated;
      }
      return prev;
    });
  }, [usageLog, schedule]);

  // Persist
  useEffect(() => {
    save(data, profileId);
  }, [data, profileId]);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayUnderLimit = data.datesUnderLimit.includes(today);
  const { current, longest } = useMemo(
    () => calcStreak(data.datesUnderLimit),
    [data.datesUnderLimit]
  );

  // Stars = 1 per 5 days under limit
  const totalStars = Math.floor(data.datesUnderLimit.length / 5);

  const rewards: RewardsData = {
    currentStreak: current,
    longestStreak: longest,
    totalStars,
    todayUnderLimit,
  };

  return { rewards };
}
