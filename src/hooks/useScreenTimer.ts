import { useState, useEffect, useCallback, useRef } from "react";

interface ProfileTimerState {
  dailyTotal: number;
  dailyRemaining: number;
  weeklyTotal: number;
  weeklyRemaining: number;
  lastDailyKey: string;
  lastWeeklyKey: string;
}

interface StoredState {
  profileStates: Record<string, ProfileTimerState>;
  isRunning: boolean;
  endTimestamp: number | null;
  runStartTime: number | null;
  /** Snapshot of each active profile's remaining at run start */
  runStartSnapshots: Record<string, { daily: number; weekly: number }>;
  activeProfileIds: string[];
}

const STORAGE_KEY = "screen-timer-multi-state";

const DEFAULT_DAILY = 3600;
const DEFAULT_WEEKLY = 7 * 3600;
const DEFAULT_PROFILE_KEY = "__default__";

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

function defaultProfileState(): ProfileTimerState {
  return {
    dailyTotal: DEFAULT_DAILY,
    dailyRemaining: DEFAULT_DAILY,
    weeklyTotal: DEFAULT_WEEKLY,
    weeklyRemaining: DEFAULT_WEEKLY,
    lastDailyKey: getTodayKey(),
    lastWeeklyKey: getWeekKey(),
  };
}

function loadState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


/** Ensure profile state has correct date keys, resetting if needed */
function refreshProfileState(ps: ProfileTimerState): ProfileTimerState {
  const todayKey = getTodayKey();
  const weekKey = getWeekKey();
  let updated = { ...ps };
  if (updated.lastDailyKey !== todayKey) {
    updated.dailyRemaining = updated.dailyTotal;
    updated.lastDailyKey = todayKey;
  }
  if (updated.lastWeeklyKey !== weekKey) {
    updated.weeklyRemaining = updated.weeklyTotal;
    updated.lastWeeklyKey = weekKey;
  }
  return updated;
}

export type ActiveLimit = "daily" | "weekly" | "none";

export interface ProfileTimerInfo {
  profileId: string;
  dailyTotal: number;
  dailyRemaining: number;
  weeklyTotal: number;
  weeklyRemaining: number;
  effectiveRemaining: number;
  activeLimit: ActiveLimit;
}

export function useScreenTimer(activeProfileIds: string[]) {
  const effectiveIds = activeProfileIds.length > 0 ? activeProfileIds : [DEFAULT_PROFILE_KEY];

  const [profileStates, setProfileStates] = useState<Record<string, ProfileTimerState>>(() => {
    const saved = loadState();
    if (saved?.profileStates) {
      // Refresh date keys
      const refreshed: Record<string, ProfileTimerState> = {};
      for (const [k, v] of Object.entries(saved.profileStates)) {
        refreshed[k] = refreshProfileState(v);
      }
      return refreshed;
    }
    return { [DEFAULT_PROFILE_KEY]: defaultProfileState() };
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimestampRef = useRef<number | null>(null);
  const runStartTimeRef = useRef<number>(0);
  const runStartSnapshotsRef = useRef<Record<string, { daily: number; weekly: number }>>({});

  // Get or create profile state
  const getProfileState = useCallback((id: string): ProfileTimerState => {
    return profileStates[id] ?? defaultProfileState();
  }, [profileStates]);

  const getProfileTimerInfo = useCallback((id: string): ProfileTimerInfo => {
    const ps = getProfileState(id);
    const eff = Math.min(ps.dailyRemaining, ps.weeklyRemaining);
    const al: ActiveLimit = eff <= 0 ? "none" : ps.dailyRemaining <= ps.weeklyRemaining ? "daily" : "weekly";

    return {
      profileId: id,
      dailyTotal: ps.dailyTotal,
      dailyRemaining: ps.dailyRemaining,
      weeklyTotal: ps.weeklyTotal,
      weeklyRemaining: ps.weeklyRemaining,
      effectiveRemaining: eff,
      activeLimit: al,
    };
  }, [getProfileState]);

  // Compute per-profile info for active profiles
  const profileTimerInfos: ProfileTimerInfo[] = effectiveIds.map((id) => getProfileTimerInfo(id));

  // The overall timer shows the minimum effective remaining across active profiles
  const effectiveRemaining = profileTimerInfos.length > 0
    ? Math.min(...profileTimerInfos.map((p) => p.effectiveRemaining))
    : 0;

  const lowestProfile = profileTimerInfos.reduce(
    (min, p) => (p.effectiveRemaining < min.effectiveRemaining ? p : min),
    profileTimerInfos[0] ?? { activeLimit: "none" as ActiveLimit, effectiveRemaining: 0, dailyTotal: DEFAULT_DAILY, weeklyTotal: DEFAULT_WEEKLY }
  );

  const activeLimit = lowestProfile.activeLimit;
  const effectiveTotal = activeLimit === "weekly" ? lowestProfile.weeklyTotal : lowestProfile.dailyTotal;
  const progress = effectiveTotal > 0 ? effectiveRemaining / effectiveTotal : 0;

  // Restore running state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved?.isRunning && saved.endTimestamp && saved.runStartTime) {
      const nowMs = Date.now();
      const elapsed = Math.round((nowMs - saved.runStartTime) / 1000);

      const newStates = { ...profileStates };
      let anyFinished = false;

      for (const id of saved.activeProfileIds) {
        const snap = saved.runStartSnapshots[id];
        if (!snap) continue;
        const ps = newStates[id] ?? defaultProfileState();
        const newDaily = Math.max(0, snap.daily - elapsed);
        const newWeekly = Math.max(0, snap.weekly - elapsed);
        newStates[id] = { ...ps, dailyRemaining: newDaily, weeklyRemaining: newWeekly };
        if (newDaily <= 0 || newWeekly <= 0) anyFinished = true;
      }

      setProfileStates(newStates);

      if (anyFinished || nowMs >= saved.endTimestamp) {
        setIsFinished(true);
        sendNotification();
      } else {
        endTimestampRef.current = saved.endTimestamp;
        runStartTimeRef.current = saved.runStartTime;
        runStartSnapshotsRef.current = saved.runStartSnapshots;
        setIsRunning(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save state
  useEffect(() => {
    saveState({
      profileStates,
      isRunning,
      endTimestamp: endTimestampRef.current,
      runStartTime: isRunning ? runStartTimeRef.current : null,
      runStartSnapshots: runStartSnapshotsRef.current,
      activeProfileIds: effectiveIds,
    });
  }, [profileStates, isRunning, effectiveIds]);

  // Tick function
  const tick = useCallback(() => {
    if (!runStartTimeRef.current) return;
    const elapsed = Math.round((Date.now() - runStartTimeRef.current) / 1000);

    setProfileStates((prev) => {
      const next = { ...prev };
      let anyFinished = false;

      for (const id of effectiveIds) {
        const snap = runStartSnapshotsRef.current[id];
        if (!snap) continue;
        const ps = next[id] ?? defaultProfileState();
        const newDaily = Math.max(0, snap.daily - elapsed);
        const newWeekly = Math.max(0, snap.weekly - elapsed);
        next[id] = { ...ps, dailyRemaining: newDaily, weeklyRemaining: newWeekly };
        if (newDaily <= 0 || newWeekly <= 0) anyFinished = true;
      }

      if (anyFinished) {
        setIsRunning(false);
        setIsFinished(true);
        endTimestampRef.current = null;
        sendNotification();
      }

      return next;
    });
  }, [effectiveIds]);

  // Countdown interval
  useEffect(() => {
    if (isRunning && effectiveRemaining > 0) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, effectiveRemaining > 0, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isRunning && endTimestampRef.current) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning, tick]);

  const start = useCallback(() => {
    if (effectiveRemaining <= 0) return;
    const snapshots: Record<string, { daily: number; weekly: number }> = {};
    for (const id of effectiveIds) {
      const ps = profileStates[id] ?? defaultProfileState();
      snapshots[id] = { daily: ps.dailyRemaining, weekly: ps.weeklyRemaining };
    }
    runStartSnapshotsRef.current = snapshots;
    runStartTimeRef.current = Date.now();
    endTimestampRef.current = Date.now() + effectiveRemaining * 1000;
    setIsRunning(true);
  }, [effectiveRemaining, effectiveIds, profileStates]);

  const pause = useCallback(() => {
    // Finalize elapsed time
    if (runStartTimeRef.current) {
      const elapsed = Math.round((Date.now() - runStartTimeRef.current) / 1000);
      setProfileStates((prev) => {
        const next = { ...prev };
        for (const id of effectiveIds) {
          const snap = runStartSnapshotsRef.current[id];
          if (!snap) continue;
          const ps = next[id] ?? defaultProfileState();
          next[id] = {
            ...ps,
            dailyRemaining: Math.max(0, snap.daily - elapsed),
            weeklyRemaining: Math.max(0, snap.weekly - elapsed),
          };
        }
        return next;
      });
    }
    endTimestampRef.current = null;
    setIsRunning(false);
  }, [effectiveIds]);

  const reset = useCallback(() => {
    setIsRunning(false);
    endTimestampRef.current = null;
    setIsFinished(false);
    setProfileStates((prev) => {
      const next = { ...prev };
      for (const id of effectiveIds) {
        const ps = next[id] ?? defaultProfileState();
        next[id] = { ...ps, dailyRemaining: ps.dailyTotal, weeklyRemaining: ps.weeklyTotal };
      }
      return next;
    });
  }, [effectiveIds]);

  const setDailyTime = useCallback((seconds: number, profileId?: string) => {
    const ids = profileId ? [profileId] : effectiveIds;
    setIsRunning(false);
    endTimestampRef.current = null;
    setIsFinished(false);
    setProfileStates((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        const ps = next[id] ?? defaultProfileState();
        next[id] = { ...ps, dailyTotal: seconds, dailyRemaining: seconds, lastDailyKey: getTodayKey() };
      }
      return next;
    });
  }, [effectiveIds]);

  const setWeeklyTime = useCallback((seconds: number, profileId?: string) => {
    const ids = profileId ? [profileId] : effectiveIds;
    setIsRunning(false);
    endTimestampRef.current = null;
    setIsFinished(false);
    setProfileStates((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        const ps = next[id] ?? defaultProfileState();
        next[id] = { ...ps, weeklyTotal: seconds, weeklyRemaining: seconds, lastWeeklyKey: getWeekKey() };
      }
      return next;
    });
  }, [effectiveIds]);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      return result === "granted";
    }
    return false;
  }, []);

  return {
    profileTimerInfos,
    getProfileTimerInfo,
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
