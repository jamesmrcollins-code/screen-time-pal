import React, { useState } from "react";
import { TimerDisplay } from "./TimerDisplay";
import type { ActiveLimit } from "@/hooks/useScreenTimer";

interface Props {
  dailyRemaining: number;
  weeklyRemaining: number;
  dailyProgress: number;
  weeklyProgress: number;
  isRunning: boolean;
  isFinished: boolean;
  activeLimit: ActiveLimit;
}

export const SwipeableTimerDisplay: React.FC<Props> = ({
  dailyRemaining,
  weeklyRemaining,
  dailyProgress,
  weeklyProgress,
  isRunning,
  isFinished,
}) => {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const remaining = view === "daily" ? dailyRemaining : weeklyRemaining;
  const progress = view === "daily" ? dailyProgress : weeklyProgress;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setView("daily")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            view === "daily"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-secondary text-muted-foreground border border-transparent"
          }`}
        >
          📅 Daily
        </button>
        <button
          onClick={() => setView("weekly")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            view === "weekly"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-secondary text-muted-foreground border border-transparent"
          }`}
        >
          📆 Weekly
        </button>
      </div>

      <TimerDisplay
        remainingSeconds={remaining}
        progress={progress}
        isRunning={isRunning}
        isFinished={isFinished}
        activeLimit={view}
      />
    </div>
  );
};
