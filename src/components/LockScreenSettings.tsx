import React from "react";
import { Switch } from "@/components/ui/switch";
import { Lock, Bell } from "lucide-react";
import type { LockScreenSettings as Settings } from "@/hooks/useLockScreenSettings";

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
  hasPinSet: boolean;
}

export const LockScreenSettings: React.FC<Props> = ({ settings, onUpdate, hasPinSet }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">When Time's Up</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Lock Screen</p>
            <p className="text-xs text-muted-foreground">
              {hasPinSet ? "Requires PIN to unlock" : "Set a PIN first to enable"}
            </p>
          </div>
        </div>
        <Switch
          checked={settings.lockOnZero}
          onCheckedChange={(v) => onUpdate({ lockOnZero: v })}
          disabled={!hasPinSet}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Alarm Sound & Vibration</p>
            <p className="text-xs text-muted-foreground">Plays until dismissed</p>
          </div>
        </div>
        <Switch
          checked={settings.alarmOnZero}
          onCheckedChange={(v) => onUpdate({ alarmOnZero: v })}
        />
      </div>
    </div>
  );
};
