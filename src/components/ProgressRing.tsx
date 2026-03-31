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

  const shouldPulse = isRunning && progress < 0.15 && !isFinished;

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
      {/* Warning background glow */}
      {isRunning && progress < 0.35 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth}
          fill={progress < 0.15 ? "hsl(var(--timer-danger) / 0.08)" : "hsl(var(--timer-warning) / 0.06)"}
          className="transition-all duration-1000"
        >
          {shouldPulse && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
          )}
        </circle>
      )}
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
          filter: isRunning ? `drop-shadow(0 0 ${progress < 0.15 ? 12 : 8}px ${getStrokeColor()})` : "none",
        }}
      >
        {shouldPulse && (
          <animate attributeName="stroke-width" values={`${strokeWidth};${strokeWidth + 4};${strokeWidth}`} dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
    </svg>
  );
};
