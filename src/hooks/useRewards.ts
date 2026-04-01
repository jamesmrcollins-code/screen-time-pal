import { useState, useCallback, useEffect } from "react";
import { format, subDays } from "date-fns";

export interface RewardsData {
  currentStreak: number;
  longestStreak: number;
  totalStars: number;
  todayUnderLimit: boolean;
}

const REWARDS_KEY = "screen-timer-rewards";

interface StoredRewards {
  datesUnderLimit: string[]; // YYYY-MM-DD
}

function load(profileId: string | null): StoredRewards {
  try {
    const key = profileId ? `${REWARDS_KEY}-${profileId}` : REWARDS_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { datesUnderLimit: [] };
  } catch {
    return { datesUnderLimit: [] };
  }
}

function save(data: StoredRewards, profileId: string | null) {
  const key = profileId ? `${REWARDS_KEY}-${profileId}` : REWARDS_KEY;
  localStorage.setItem(key, JSON.stringify(data));
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
      if (i < 30) current = streak;
      longest = Math.max(longest, streak);
    } else {
      if (i === 0) continue; // today not over yet
      if (current === 0 && i <= 1) current = 0;
      streak = 0;
    }
  }
  return { current, longest };
}

export function useRewards(profileId: string | null = null) {
  const [data, setData] = useState<StoredRewards>(() => load(profileId));

  useEffect(() => {
    setData(load(profileId));
  }, [profileId]);

  useEffect(() => {
    save(data, profileId);
  }, [data, profileId]);

  const markTodayUnderLimit = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setData((prev) => {
      if (prev.datesUnderLimit.includes(today)) return prev;
      return {
        datesUnderLimit: [...prev.datesUnderLimit, today],
      };
    });
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayUnderLimit = data.datesUnderLimit.includes(today);
  const { current, longest } = calcStreak(data.datesUnderLimit);

  // Stars = 1 for every 5 days under limit
  const totalStars = Math.floor(data.datesUnderLimit.length / 5);

  const rewards: RewardsData = {
    currentStreak: current,
    longestStreak: longest,
    totalStars,
    todayUnderLimit,
  };

  return { rewards, markTodayUnderLimit };
}
