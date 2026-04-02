import React from "react";
import { ProgressRing } from "./ProgressRing";
import type { ActiveLimit } from "@/hooks/useScreenTimer";

interface TimerDisplayProps {
  remainingSeconds: number;
  progress: number;
  isRunning: boolean;
  isFinished: boolean;
  activeLimit?: ActiveLimit;
}

function formatTime(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
  };
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  progress,
  isRunning,
  isFinished,
  activeLimit,
}) => {
  const { hours, minutes, seconds } = formatTime(remainingSeconds);

  const statusText = isFinished
    ? "Time's up!"
    : isRunning
    ? activeLimit === "weekly"
      ? "Weekly limit active"
      : "Daily limit active"
    : "Paused";

  return (
    <div className="relative flex items-center justify-center">
      <ProgressRing progress={progress} isRunning={isRunning} isFinished={isFinished} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold tabular-nums text-foreground tracking-tight font-display">
            {hours}
          </span>
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <span className="text-5xl font-extrabold tabular-nums text-foreground tracking-tight font-display">
            {minutes}
          </span>
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <span className="text-5xl font-extrabold tabular-nums text-foreground tracking-tight font-display">
            {seconds}
          </span>
        </div>
        <span className="text-sm text-muted-foreground font-medium mt-1">
          {statusText}
        </span>
      </div>
    </div>
  );
};
