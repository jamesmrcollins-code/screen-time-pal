import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export interface BonusTask {
  id: string;
  profileId: string | null;
  taskName: string;
  bonusMinutes: number;
}

export interface BonusCompletion {
  id: string;
  taskId: string;
  profileId: string | null;
  completedDate: string;
  approved: boolean;
  taskName?: string;
  bonusMinutes?: number;
}

export function useBonusTasks(profileId: string | null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<BonusTask[]>([]);
  const [completions, setCompletions] = useState<BonusCompletion[]>([]);
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  // Load tasks and today's completions
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load tasks for this profile (or global tasks with null profile)
      const { data: taskData } = await supabase
        .from("bonus_tasks")
        .select("*")
        .eq("user_id", user.id)
        .or(profileId ? `profile_id.eq.${profileId},profile_id.is.null` : "profile_id.is.null");

      if (taskData) {
        setTasks(
          taskData.map((t) => ({
            id: t.id,
            profileId: t.profile_id,
            taskName: t.task_name,
            bonusMinutes: t.bonus_minutes,
          }))
        );
      }

      // Load today's completions
      const { data: compData } = await supabase
        .from("bonus_completions")
        .select("*, bonus_tasks(task_name, bonus_minutes)")
        .eq("user_id", user.id)
        .eq("completed_date", today);

      if (compData) {
        setCompletions(
          compData
            .filter((c) => !profileId || c.profile_id === profileId || c.profile_id === null)
            .map((c) => ({
              id: c.id,
              taskId: c.task_id,
              profileId: c.profile_id,
              completedDate: c.completed_date,
              approved: c.approved,
              taskName: (c as any).bonus_tasks?.task_name,
              bonusMinutes: (c as any).bonus_tasks?.bonus_minutes,
            }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user, profileId, today]);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(
    async (taskName: string, bonusMinutes: number) => {
      if (!user) return;
      await supabase.from("bonus_tasks").insert({
        user_id: user.id,
        profile_id: profileId,
        task_name: taskName,
        bonus_minutes: bonusMinutes,
      });
      await load();
    },
    [user, profileId, load]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!user) return;
      await supabase.from("bonus_tasks").delete().eq("id", taskId);
      await load();
    },
    [user, load]
  );

  const markDone = useCallback(
    async (taskId: string) => {
      if (!user) return;
      // Check if already completed today
      const existing = completions.find(
        (c) => c.taskId === taskId && c.completedDate === today
      );
      if (existing) return;

      await supabase.from("bonus_completions").insert({
        task_id: taskId,
        user_id: user.id,
        profile_id: profileId,
        completed_date: today,
        approved: false,
      });
      await load();
    },
    [user, profileId, today, completions, load]
  );

  const approve = useCallback(
    async (completionId: string) => {
      if (!user) return;
      await supabase
        .from("bonus_completions")
        .update({ approved: true })
        .eq("id", completionId);
      await load();
    },
    [user, load]
  );

  // Total approved bonus minutes for today
  const todayBonusMinutes = completions
    .filter((c) => c.approved && c.completedDate === today)
    .reduce((sum, c) => sum + (c.bonusMinutes ?? 0), 0);

  return {
    tasks,
    completions,
    loading,
    addTask,
    removeTask,
    markDone,
    approve,
    todayBonusMinutes,
    reload: load,
  };
}
