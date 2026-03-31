import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "daily" | "weekly";

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  lastSavedDate: string;
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
      icon: "/placeholder.svg",
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

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      const currentKey = getKey(saved.mode);
      if (saved.lastSavedDate === currentKey) {
        setTotalSeconds(saved.totalSeconds);
        setRemainingSeconds(saved.remainingSeconds);
        setMode(saved.mode);
        if (saved.remainingSeconds <= 0) setIsFinished(true);
      }
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState({
      totalSeconds,
      remainingSeconds,
      isRunning: false,
      mode,
      lastSavedDate: getKey(mode),
    });
  }, [totalSeconds, remainingSeconds, mode]);

  // Countdown interval
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            sendNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingSeconds]);

  const start = useCallback(() => {
    if (remainingSeconds > 0) setIsRunning(true);
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setIsFinished(false);
  }, [totalSeconds]);

  const setTime = useCallback((seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
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
