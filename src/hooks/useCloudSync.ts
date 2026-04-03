import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UsageEntry } from "@/hooks/useUsageLog";

/**
 * Syncs usage log, rewards, and schedule settings to the cloud.
 * Loads from cloud on mount (if authenticated), merges with localStorage,
 * and saves back on changes.
 */
export function useCloudSync(
  usageLog: UsageEntry[],
  addUsageBulk: (entries: UsageEntry[]) => void,
  rewardsData: {
    datesUnderLimit: string[];
    lastCheckedDate: string;
  },
  setRewardsFromCloud: (data: { datesUnderLimit: string[]; lastCheckedDate: string }) => void,
  themeData: {
    unlockedIds: string[];
    activeThemeId: string;
  },
  setThemeFromCloud: (data: { unlockedIds: string[]; activeThemeId: string }) => void,
  scheduleData: {
    useSchedule: boolean;
    weekdayLimitSeconds: number;
    weekendLimitSeconds: number;
  },
  setScheduleFromCloud: (data: { useSchedule: boolean; weekdayLimitSeconds: number; weekendLimitSeconds: number }) => void
) {
  const { user } = useAuth();
  const hasSynced = useRef(false);
  const prevUsageLength = useRef(usageLog.length);

  // Load from cloud on first auth
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    const loadFromCloud = async () => {
      try {
        // Load usage logs
        const { data: cloudUsage } = await supabase
          .from("usage_logs")
          .select("date, seconds_used, profile_id")
          .eq("user_id", user.id);

        if (cloudUsage && cloudUsage.length > 0) {
          const merged = mergeUsage(
            usageLog,
            cloudUsage.map((r) => ({
              date: r.date,
              secondsUsed: r.seconds_used,
              profileId: r.profile_id ?? null,
            }))
          );
          addUsageBulk(merged);
        }

        // Load rewards
        const { data: cloudRewards } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cloudRewards) {
          const localDates = new Set(rewardsData.datesUnderLimit);
          const cloudDates: string[] = cloudRewards.dates_under_limit ?? [];
          cloudDates.forEach((d) => localDates.add(d));
          setRewardsFromCloud({
            datesUnderLimit: Array.from(localDates),
            lastCheckedDate: cloudRewards.last_checked_date || rewardsData.lastCheckedDate,
          });

          setThemeFromCloud({
            unlockedIds: cloudRewards.unlocked_themes ?? ["default"],
            activeThemeId: cloudRewards.active_theme_id ?? "default",
          });
        }

        // Load schedule
        const { data: cloudSchedule } = await supabase
          .from("schedule_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cloudSchedule) {
          const days = cloudSchedule.days as Record<string, any>;
          setScheduleFromCloud({
            useSchedule: cloudSchedule.use_schedule,
            weekdayLimitSeconds: days?.weekdayLimitSeconds ?? 3600,
            weekendLimitSeconds: days?.weekendLimitSeconds ?? 7200,
          });
        }
      } catch (err) {
        console.error("Cloud sync load error:", err);
      }
    };

    loadFromCloud();
  }, [user]);

  // Save usage to cloud on changes
  const saveUsageToCloud = useCallback(async () => {
    if (!user) return;
    for (const entry of usageLog) {
      await supabase.from("usage_logs").upsert(
        {
          user_id: user.id,
          date: entry.date,
          seconds_used: entry.secondsUsed,
          profile_id: entry.profileId ?? null,
        },
        { onConflict: "user_id,date,profile_id" }
      );
    }
  }, [user, usageLog]);

  // Debounced save on usage changes
  useEffect(() => {
    if (!user || usageLog.length === prevUsageLength.current) return;
    prevUsageLength.current = usageLog.length;
    const t = setTimeout(saveUsageToCloud, 5000);
    return () => clearTimeout(t);
  }, [usageLog, user, saveUsageToCloud]);

  // Save rewards + theme to cloud
  const saveRewardsToCloud = useCallback(async () => {
    if (!user) return;
    await supabase.from("rewards").upsert(
      {
        user_id: user.id,
        dates_under_limit: rewardsData.datesUnderLimit,
        last_checked_date: rewardsData.lastCheckedDate,
        unlocked_themes: themeData.unlockedIds,
        active_theme_id: themeData.activeThemeId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }, [user, rewardsData, themeData]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(saveRewardsToCloud, 3000);
    return () => clearTimeout(t);
  }, [rewardsData, themeData, user, saveRewardsToCloud]);

  // Save schedule to cloud
  const saveScheduleToCloud = useCallback(async () => {
    if (!user) return;
    await supabase.from("schedule_settings").upsert(
      {
        user_id: user.id,
        use_schedule: scheduleData.useSchedule,
        days: scheduleData.days,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }, [user, scheduleData]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(saveScheduleToCloud, 3000);
    return () => clearTimeout(t);
  }, [scheduleData, user, saveScheduleToCloud]);
}

function mergeUsage(local: UsageEntry[], cloud: UsageEntry[]): UsageEntry[] {
  const key = (e: UsageEntry) => `${e.date}|${e.profileId ?? ""}`;
  const map = new Map<string, UsageEntry>();
  for (const e of local) {
    const k = key(e);
    const existing = map.get(k);
    if (!existing || e.secondsUsed > existing.secondsUsed) map.set(k, e);
  }
  for (const e of cloud) {
    const k = key(e);
    const existing = map.get(k);
    if (!existing || e.secondsUsed > existing.secondsUsed) map.set(k, e);
  }
  return Array.from(map.values());
}
