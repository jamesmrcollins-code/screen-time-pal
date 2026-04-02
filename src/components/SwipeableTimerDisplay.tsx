import React, { useState, useRef, useCallback } from "react";
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
  activeLimit,
}) => {
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
    setSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDelta.current) > 10) setSwiping(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current < 0) {
        setView("weekly");
      } else {
        setView("daily");
      }
    }
    setSwiping(false);
  }, []);

  const remaining = view === "daily" ? dailyRemaining : weeklyRemaining;
  const progress = view === "daily" ? dailyProgress : weeklyProgress;

  return (
    <div
      className="w-full flex flex-col items-center select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dot indicators */}
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
        activeLimit={view === "daily" ? "daily" : "weekly"}
      />

      <p className="text-xs text-muted-foreground mt-2">Swipe to switch</p>
    </div>
  );
};
