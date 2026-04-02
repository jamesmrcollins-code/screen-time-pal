import { useState, useEffect, useCallback, useRef } from "react";

interface DualTimerState {
  dailyTotalSeconds: number;
  dailyRemainingSeconds: number;
  weeklyTotalSeconds: number;
  weeklyRemainingSeconds: number;
  isRunning: boolean;
  lastDailyKey: string;
  lastWeeklyKey: string;
  /** Epoch ms when the timer should hit zero (set when running) */
  endTimestamp: number | null;
}

const STORAGE_KEY = "screen-timer-dual-state";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(new Date(d).setDate(diff));
  return monday.toISOString().split("T")[0];
}

function loadState(): DualTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state: DualTimerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sendNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Screen Time's Up!", {
      body: "The allocated screen time has been used up.",
      icon: "/favicon.svg",
    });
  }
}

export type ActiveLimit = "daily" | "weekly" | "none";

export function useScreenTimer() {
  const [dailyTotalSeconds, setDailyTotalSeconds] = useState(3600);
  const [dailyRemainingSeconds, setDailyRemainingSeconds] = useState(3600);
  const [weeklyTotalSeconds, setWeeklyTotalSeconds] = useState(7 * 3600);
  const [weeklyRemainingSeconds, setWeeklyRemainingSeconds] = useState(7 * 3600);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimestampRef = useRef<number | null>(null);
  /** Tracks how many seconds each limit had when the current run started */
  const runStartDailyRef = useRef(0);
  const runStartWeeklyRef = useRef(0);
  const runStartTimeRef = useRef(0);

  // Which limit is currently the binding constraint
  const activeLimit: ActiveLimit =
    dailyRemainingSeconds <= 0 || weeklyRemainingSeconds <= 0
      ? "none"
      : dailyRemainingSeconds <= weeklyRemainingSeconds
      ? "daily"
      : "weekly";

  const effectiveRemaining = Math.min(dailyRemainingSeconds, weeklyRemainingSeconds);
  const effectiveTotal = activeLimit === "weekly" ? weeklyTotalSeconds : dailyTotalSeconds;
  const progress = effectiveTotal > 0 ? effectiveRemaining / effectiveTotal : 0;

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState();
    if (!saved) return;

    const todayKey = getTodayKey();
    const weekKey = getWeekKey();

    // Daily: reset if day changed
    if (saved.lastDailyKey === todayKey) {
      setDailyTotalSeconds(saved.dailyTotalSeconds);
      setDailyRemainingSeconds(saved.dailyRemainingSeconds);
    } else {
      setDailyTotalSeconds(saved.dailyTotalSeconds);
      setDailyRemainingSeconds(saved.dailyTotalSeconds);
    }

    // Weekly: reset if week changed
    if (saved.lastWeeklyKey === weekKey) {
      setWeeklyTotalSeconds(saved.weeklyTotalSeconds);
      setWeeklyRemainingSeconds(saved.weeklyRemainingSeconds);
    } else {
      setWeeklyTotalSeconds(saved.weeklyTotalSeconds);
      setWeeklyRemainingSeconds(saved.weeklyTotalSeconds);
    }

    // If was running, recalculate from endTimestamp
    if (saved.isRunning && saved.endTimestamp) {
      const nowMs = Date.now();
      const msLeft = saved.endTimestamp - nowMs;
      if (msLeft <= 0) {
        // Expired while away — figure out how much was used
        const elapsedSinceStart = Math.round((nowMs - (saved.endTimestamp - Math.min(saved.dailyRemainingSeconds, saved.weeklyRemainingSeconds) * 1000)) / 1000);
        setDailyRemainingSeconds((prev) => Math.max(0, saved.lastDailyKey === todayKey ? saved.dailyRemainingSeconds - Math.max(0, elapsedSinceStart - (saved.dailyRemainingSeconds - 0)) : saved.dailyTotalSeconds));
        // Simpler: both hit 0 if endTimestamp passed
        if (saved.lastDailyKey === todayKey) setDailyRemainingSeconds(Math.max(0, saved.dailyRemainingSeconds - Math.ceil((nowMs - (saved.endTimestamp - Math.min(saved.dailyRemainingSeconds, saved.weeklyRemainingSeconds) * 1000)) / 1000)));
        if (saved.lastWeeklyKey === weekKey) setWeeklyRemainingSeconds(Math.max(0, saved.weeklyRemainingSeconds - Math.ceil((nowMs - (saved.endTimestamp - Math.min(saved.dailyRemainingSeconds, saved.weeklyRemainingSeconds) * 1000)) / 1000)));
        setIsFinished(true);
        sendNotification();
      } else {
        // Still running — calculate elapsed since run started
        const effectiveRemainingAtStart = Math.min(
          saved.lastDailyKey === todayKey ? saved.dailyRemainingSeconds : saved.dailyTotalSeconds,
          saved.lastWeeklyKey === weekKey ? saved.weeklyRemainingSeconds : saved.weeklyTotalSeconds
        );
        const elapsed = effectiveRemainingAtStart - Math.round(msLeft / 1000);

        if (saved.lastDailyKey === todayKey) {
          setDailyRemainingSeconds(Math.max(0, saved.dailyRemainingSeconds - elapsed));
        }
        if (saved.lastWeeklyKey === weekKey) {
          setWeeklyRemainingSeconds(Math.max(0, saved.weeklyRemainingSeconds - elapsed));
        }

        endTimestampRef.current = saved.endTimestamp;
        setIsRunning(true);
      }
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState({
      dailyTotalSeconds,
      dailyRemainingSeconds,
      weeklyTotalSeconds,
      weeklyRemainingSeconds,
      isRunning,
      lastDailyKey: getTodayKey(),
      lastWeeklyKey: getWeekKey(),
      endTimestamp: endTimestampRef.current,
    });
  }, [dailyTotalSeconds, dailyRemainingSeconds, weeklyTotalSeconds, weeklyRemainingSeconds, isRunning]);

  // Countdown interval
  useEffect(() => {
    if (isRunning && effectiveRemaining > 0) {
      intervalRef.current = setInterval(() => {
        if (!endTimestampRef.current) return;
        const nowMs = Date.now();
        const elapsed = Math.round((nowMs - runStartTimeRef.current) / 1000);

        const newDaily = Math.max(0, runStartDailyRef.current - elapsed);
        const newWeekly = Math.max(0, runStartWeeklyRef.current - elapsed);

        setDailyRemainingSeconds(newDaily);
        setWeeklyRemainingSeconds(newWeekly);

        if (newDaily <= 0 || newWeekly <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          endTimestampRef.current = null;
          sendNotification();
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, effectiveRemaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Visibility change handler
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && endTimestampRef.current && isRunning) {
        const nowMs = Date.now();
        const elapsed = Math.round((nowMs - runStartTimeRef.current) / 1000);

        const newDaily = Math.max(0, runStartDailyRef.current - elapsed);
        const newWeekly = Math.max(0, runStartWeeklyRef.current - elapsed);

        setDailyRemainingSeconds(newDaily);
        setWeeklyRemainingSeconds(newWeekly);

        if (newDaily <= 0 || newWeekly <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          endTimestampRef.current = null;
          sendNotification();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning]);

  const start = useCallback(() => {
    const eff = Math.min(dailyRemainingSeconds, weeklyRemainingSeconds);
    if (eff > 0) {
      runStartDailyRef.current = dailyRemainingSeconds;
      runStartWeeklyRef.current = weeklyRemainingSeconds;
      runStartTimeRef.current = Date.now();
      endTimestampRef.current = Date.now() + eff * 1000;
      setIsRunning(true);
    }
  }, [dailyRemainingSeconds, weeklyRemainingSeconds]);

  const pause = useCallback(() => {
    if (runStartTimeRef.current) {
      const elapsed = Math.round((Date.now() - runStartTimeRef.current) / 1000);
      setDailyRemainingSeconds(Math.max(0, runStartDailyRef.current - elapsed));
      setWeeklyRemainingSeconds(Math.max(0, runStartWeeklyRef.current - elapsed));
    }
    endTimestampRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    endTimestampRef.current = null;
    setDailyRemainingSeconds(dailyTotalSeconds);
    setWeeklyRemainingSeconds(weeklyTotalSeconds);
    setIsFinished(false);
  }, [dailyTotalSeconds, weeklyTotalSeconds]);

  const setDailyTime = useCallback((seconds: number) => {
    setDailyTotalSeconds(seconds);
    setDailyRemainingSeconds(seconds);
    setIsRunning(false);
    endTimestampRef.current = null;
    setIsFinished(false);
  }, []);

  const setWeeklyTime = useCallback((seconds: number) => {
    setWeeklyTotalSeconds(seconds);
    setWeeklyRemainingSeconds(seconds);
    setIsRunning(false);
    endTimestampRef.current = null;
    setIsFinished(false);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      return result === "granted";
    }
    return false;
  }, []);

  return {
    dailyTotalSeconds,
    dailyRemainingSeconds,
    weeklyTotalSeconds,
    weeklyRemainingSeconds,
    remainingSeconds: effectiveRemaining,
    isRunning,
    isFinished,
    activeLimit,
    progress,
    start,
    pause,
    reset,
    setDailyTime,
    setWeeklyTime,
    requestNotificationPermission,
  };
}
