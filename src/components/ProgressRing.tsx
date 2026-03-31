import React from "react";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  isRunning: boolean;
  isFinished: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 280,
  strokeWidth = 12,
  isRunning,
  isFinished,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const getStrokeColor = () => {
    if (isFinished) return "hsl(var(--timer-danger))";
    if (progress < 0.15) return "hsl(var(--timer-danger))";
    if (progress < 0.35) return "hsl(var(--timer-warning))";
    return "hsl(var(--timer-active))";
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--timer-track))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getStrokeColor()}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-linear"
        style={{
          filter: isRunning ? `drop-shadow(0 0 8px ${getStrokeColor()})` : "none",
        }}
      />
    </svg>
  );
};
