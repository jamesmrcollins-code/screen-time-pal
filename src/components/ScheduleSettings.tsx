import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import type { ScheduleSettings as Settings } from "@/hooks/useSchedule";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
  profiles?: Profile[];
  selectedProfileId?: string | null;
  onSelectProfile?: (id: string) => void;
}

function formatLimit(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
}

function LimitRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7"
          onClick={() => onChange(Math.max(900, value - 900))}
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="text-sm font-bold text-foreground w-14 text-center">
          {formatLimit(value)}
        </span>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7"
          onClick={() => onChange(Math.min(28800, value + 900))}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export const ScheduleSettings: React.FC<Props> = ({ settings, onUpdate, profiles, selectedProfileId, onSelectProfile }) => {
  const selectedProfile = profiles?.find((p) => p.id === selectedProfileId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-0.5">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">📅 Weekly Schedule</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Set different screen time limits for weekdays vs weekends.
      </p>

      {profiles && profiles.length > 0 && onSelectProfile && (
        <div className="space-y-2 mb-2">
          <div className="flex gap-2 flex-wrap">
            {profiles.map((profile) => (
              <button
                key={`schedule-${profile.id}`}
                type="button"
                onClick={() => onSelectProfile(profile.id)}
                aria-pressed={selectedProfileId === profile.id}
                className={`px-3 py-2 rounded-full text-xs font-semibold border-2 shadow-sm transition-all duration-150 active:scale-95 active:translate-y-px ${
                  selectedProfileId === profile.id
                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/25 shadow-md"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {profile.avatar} {profile.name}
              </button>
            ))}
          </div>
          {selectedProfile && (
            <p className="text-[11px] text-muted-foreground">
              Setting schedule for <span className="font-semibold text-foreground">{selectedProfile.avatar} {selectedProfile.name}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="schedule-toggle" className="text-sm text-foreground">Use daily schedule</Label>
        <Switch
          id="schedule-toggle"
          checked={settings.useSchedule}
          onCheckedChange={(v) => onUpdate({ useSchedule: v })}
        />
      </div>

      {settings.useSchedule && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
          <LimitRow
            label="Mon – Fri"
            value={settings.weekdayLimitSeconds}
            onChange={(v) => onUpdate({ weekdayLimitSeconds: v })}
          />
          <LimitRow
            label="Sat – Sun"
            value={settings.weekendLimitSeconds}
            onChange={(v) => onUpdate({ weekendLimitSeconds: v })}
          />
          <p className="text-xs text-muted-foreground pt-1">
            Schedule overrides the manual timer on each day.
          </p>
        </div>
      )}
    </div>
  );
};
