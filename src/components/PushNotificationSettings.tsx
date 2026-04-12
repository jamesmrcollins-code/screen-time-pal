import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PushSettings } from "@/hooks/usePushNotifier";
import { Bell } from "lucide-react";

interface Props {
  enabled: boolean;
  settings: PushSettings;
  onUpdate: (partial: Partial<PushSettings>) => void;
}

export const PushNotificationSettings: React.FC<Props> = ({ enabled, settings, onUpdate }) => {
  if (!enabled) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Alert Timing</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Choose when to receive browser push alerts.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="push-5" className="text-sm text-foreground">Alert at 5 minutes</Label>
          <Switch
            id="push-5"
            checked={settings.warnAt5Min}
            onCheckedChange={(v) => onUpdate({ warnAt5Min: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push-1" className="text-sm text-foreground">Alert at 1 minute</Label>
          <Switch
            id="push-1"
            checked={settings.warnAt1Min}
            onCheckedChange={(v) => onUpdate({ warnAt1Min: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push-0" className="text-sm text-foreground">Alert when time's up</Label>
          <Switch
            id="push-0"
            checked={settings.notifyAtZero}
            onCheckedChange={(v) => onUpdate({ notifyAtZero: v })}
          />
        </div>
      </div>
    </div>
  );
};
