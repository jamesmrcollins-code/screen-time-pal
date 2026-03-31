import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import type { ScheduleSettings as Settings, DaySchedule } from "@/hooks/useSchedule";
import { DAY_LABELS } from "@/hooks/useSchedule";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
  onUpdateDay: (day: string, partial: Partial<DaySchedule>) => void;
}

function formatLimit(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
}

export const ScheduleSettings: React.FC<Props> = ({ settings, onUpdate, onUpdateDay }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Daily Schedule</h3>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="schedule-toggle" className="text-sm text-foreground">Use daily schedule</Label>
        <Switch
          id="schedule-toggle"
          checked={settings.useSchedule}
          onCheckedChange={(v) => onUpdate({ useSchedule: v })}
        />
      </div>

      {settings.useSchedule && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          {Object.entries(settings.days).map(([day, config]) => (
            <div key={day} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(v) => onUpdateDay(day, { enabled: v })}
                  className="scale-75"
                />
                <span className={`text-sm font-medium ${config.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {DAY_LABELS[day]}
                </span>
              </div>
              {config.enabled && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6"
                    onClick={() => onUpdateDay(day, { limitSeconds: Math.max(900, config.limitSeconds - 900) })}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-bold text-foreground w-12 text-center">
                    {formatLimit(config.limitSeconds)}
                  </span>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6"
                    onClick={() => onUpdateDay(day, { limitSeconds: Math.min(28800, config.limitSeconds + 900) })}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            Schedule overrides the manual timer on enabled days.
          </p>
        </div>
      )}
    </div>
  );
};
