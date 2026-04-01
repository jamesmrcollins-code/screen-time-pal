import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "daily" | "weekly";

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  lastSavedDate: string;
  /** Epoch ms when the timer should hit zero (set when running) */
  endTimestamp: number | null;
}

const STORAGE_KEY = "screen-timer-state";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getKey(mode: TimerMode): string {
  return mode === "daily" ? getTodayKey() : getWeekKey();
}

function loadState(): TimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state: TimerState) {
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

export function useScreenTimer() {
  const [totalSeconds, setTotalSeconds] = useState(3600);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("daily");
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimestampRef = useRef<number | null>(null);

  // Load saved state on mount — recover from background/sleep
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      const currentKey = getKey(saved.mode);
      if (saved.lastSavedDate === currentKey) {
        setTotalSeconds(saved.totalSeconds);
        setMode(saved.mode);

        // If the timer was running, recalculate based on the saved end timestamp
        if (saved.isRunning && saved.endTimestamp) {
          const nowMs = Date.now();
          const secondsLeft = Math.max(0, Math.round((saved.endTimestamp - nowMs) / 1000));
          if (secondsLeft <= 0) {
            setRemainingSeconds(0);
            setIsFinished(true);
            sendNotification();
          } else {
            setRemainingSeconds(secondsLeft);
            endTimestampRef.current = saved.endTimestamp;
            setIsRunning(true);
          }
        } else {
          setRemainingSeconds(saved.remainingSeconds);
          if (saved.remainingSeconds <= 0) setIsFinished(true);
        }
      }
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState({
      totalSeconds,
      remainingSeconds,
      isRunning,
      mode,
      lastSavedDate: getKey(mode),
      endTimestamp: endTimestampRef.current,
    });
  }, [totalSeconds, remainingSeconds, mode, isRunning]);

  // Timestamp-based countdown — resilient to background throttling
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        if (!endTimestampRef.current) return;
        const nowMs = Date.now();
        const secondsLeft = Math.max(0, Math.round((endTimestampRef.current - nowMs) / 1000));
        setRemainingSeconds(secondsLeft);
        if (secondsLeft <= 0) {
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
  }, [isRunning, remainingSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate when app returns from background (visibility change)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && endTimestampRef.current && isRunning) {
        const nowMs = Date.now();
        const secondsLeft = Math.max(0, Math.round((endTimestampRef.current - nowMs) / 1000));
        setRemainingSeconds(secondsLeft);
        if (secondsLeft <= 0) {
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
    if (remainingSeconds > 0) {
      endTimestampRef.current = Date.now() + remainingSeconds * 1000;
      setIsRunning(true);
    }
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    // Recalculate remaining from timestamp before pausing
    if (endTimestampRef.current) {
      const secondsLeft = Math.max(0, Math.round((endTimestampRef.current - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
    }
    endTimestampRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    endTimestampRef.current = null;
    setRemainingSeconds(totalSeconds);
    setIsFinished(false);
  }, [totalSeconds]);

  const setTime = useCallback((seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
    endTimestampRef.current = null;
    setIsFinished(false);
  }, []);

  const changeMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    const saved = loadState();
    if (saved && saved.mode === newMode && saved.lastSavedDate === getKey(newMode)) {
      setTotalSeconds(saved.totalSeconds);
      setRemainingSeconds(saved.remainingSeconds);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      return result === "granted";
    }
    return false;
  }, []);

  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

  return {
    totalSeconds,
    remainingSeconds,
    isRunning,
    isFinished,
    mode,
    progress,
    start,
    pause,
    reset,
    setTime,
    changeMode,
    requestNotificationPermission,
  };
}
