import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface TimeSetterProps {
  onSetTime: (seconds: number) => void;
  isRunning: boolean;
  presetOptions?: "daily" | "weekly";
  valueSeconds?: number;
}

const DAILY_PRESETS = [
  { label: "30m", seconds: 30 * 60 },
  { label: "1h", seconds: 60 * 60 },
  { label: "1.5h", seconds: 90 * 60 },
  { label: "2h", seconds: 120 * 60 },
];

const WEEKLY_PRESETS = [
  { label: "5h", seconds: 5 * 3600 },
  { label: "7h", seconds: 7 * 3600 },
  { label: "10h", seconds: 10 * 3600 },
  { label: "14h", seconds: 14 * 3600 },
];

export const TimeSetter: React.FC<TimeSetterProps> = ({
  onSetTime,
  isRunning,
  presetOptions = "daily",
  valueSeconds,
}) => {
  const [hours, setHours] = useState(presetOptions === "weekly" ? 7 : 1);
  const [minutes, setMinutes] = useState(0);

  const presets = presetOptions === "weekly" ? WEEKLY_PRESETS : DAILY_PRESETS;

  useEffect(() => {
    if (typeof valueSeconds !== "number") return;

    setHours(Math.floor(valueSeconds / 3600));
    setMinutes(Math.floor((valueSeconds % 3600) / 60));
  }, [valueSeconds]);

  const adjust = (field: "hours" | "minutes", delta: number) => {
    if (field === "hours") {
      setHours(Math.max(0, Math.min(99, hours + delta)));
    } else {
      setMinutes(Math.max(0, Math.min(55, minutes + delta)));
    }
  };

  const handleSet = () => {
    const totalSec = hours * 3600 + minutes * 60;
    if (totalSec > 0) onSetTime(totalSec);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => adjust("hours", 1)} disabled={isRunning}>
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-3xl font-bold tabular-nums text-foreground w-12 text-center">{hours}</span>
          <span className="text-xs text-muted-foreground font-medium">hours</span>
          <Button variant="ghost" size="icon" onClick={() => adjust("hours", -1)} disabled={isRunning}>
            <Minus className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-3xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => adjust("minutes", 5)} disabled={isRunning}>
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-3xl font-bold tabular-nums text-foreground w-12 text-center">
            {String(minutes).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground font-medium">mins</span>
          <Button variant="ghost" size="icon" onClick={() => adjust("minutes", -5)} disabled={isRunning}>
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="secondary"
            size="sm"
            disabled={isRunning}
            onClick={() => {
              setHours(Math.floor(preset.seconds / 3600));
              setMinutes((preset.seconds % 3600) / 60);
              onSetTime(preset.seconds);
            }}
            className="rounded-full px-4 font-semibold"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Button variant="timer" size="lg" className="w-full" onClick={handleSet} disabled={isRunning}>
        Set {presetOptions === "weekly" ? "Weekly" : "Daily"} Limit
      </Button>
    </div>
  );
};
