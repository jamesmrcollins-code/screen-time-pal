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
  totalStars: number;
}

function load(profileId: string | null): StoredRewards {
  try {
    const key = profileId ? `${REWARDS_KEY}-${profileId}` : REWARDS_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { datesUnderLimit: [], totalStars: 0 };
  } catch {
    return { datesUnderLimit: [], totalStars: 0 };
  }
}

function save(data: StoredRewards, profileId: string | null) {
  const key = profileId ? `${REWARDS_KEY}-${profileId}` : REWARDS_KEY;
  localStorage.setItem(key, JSON.stringify(data));
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
        totalStars: prev.totalStars + 1,
      };
    });
  }, []);

  const getStreak = useCallback((): { current: number; longest: number } => {
    const dates = new Set(data.datesUnderLimit);
    let current = 0;
    let longest = 0;
    let streak = 0;
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) {
      const day = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (dates.has(day)) {
        streak++;
        if (i < 30) current = streak; // current streak from today
        longest = Math.max(longest, streak);
      } else {
        if (i === 0) {
          // Today not yet marked, check from yesterday
          continue;
        }
        if (current === 0 && i <= 1) current = 0;
        streak = 0;
      }
    }
    return { current, longest };
  }, [data.datesUnderLimit]);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayUnderLimit = data.datesUnderLimit.includes(today);
  const { current, longest } = getStreak();

  const rewards: RewardsData = {
    currentStreak: current,
    longestStreak: longest,
    totalStars: data.totalStars,
    todayUnderLimit,
  };

  return { rewards, markTodayUnderLimit };
}
