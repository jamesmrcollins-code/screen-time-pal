import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NotificationSettings as Settings } from "@/hooks/useNotificationSettings";
import { MessageSquare, Phone } from "lucide-react";

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
}

export const NotificationSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">SMS Notifications</h3>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="sms-toggle" className="text-sm text-foreground">Enable SMS alerts</Label>
        <Switch
          id="sms-toggle"
          checked={settings.smsEnabled}
          onCheckedChange={(v) => onUpdate({ smsEnabled: v })}
        />
      </div>

      {settings.smsEnabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Your phone number (E.164 format)
            </Label>
            <Input
              id="phone"
              placeholder="+15551234567"
              value={settings.phoneNumber}
              onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-phone" className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Twilio phone number (sender)
            </Label>
            <Input
              id="from-phone"
              placeholder="+15559876543"
              value={settings.twilioFromNumber}
              onChange={(e) => onUpdate({ twilioFromNumber: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            SMS requires Twilio to be connected. You can set this up later in your project settings.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="warn-5" className="text-sm text-foreground">Alert at 5 minutes</Label>
              <Switch
                id="warn-5"
                checked={settings.warnAt5Min}
                onCheckedChange={(v) => onUpdate({ warnAt5Min: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="warn-1" className="text-sm text-foreground">Alert at 1 minute</Label>
              <Switch
                id="warn-1"
                checked={settings.warnAt1Min}
                onCheckedChange={(v) => onUpdate({ warnAt1Min: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="warn-0" className="text-sm text-foreground">Alert when time's up</Label>
              <Switch
                id="warn-0"
                checked={settings.notifyAtZero}
                onCheckedChange={(v) => onUpdate({ notifyAtZero: v })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
