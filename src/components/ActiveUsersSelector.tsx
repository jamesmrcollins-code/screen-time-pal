import React from "react";
import type { ChildProfile } from "@/hooks/useProfiles";
import type { ProfileTimerInfo } from "@/hooks/useScreenTimer";

interface Props {
  profiles: ChildProfile[];
  activeIds: string[];
  onToggle: (id: string) => void;
  profileTimerInfos: ProfileTimerInfo[];
  focusedId: string | null;
  onFocus: (id: string) => void;
}

function formatHM(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export const ActiveUsersSelector: React.FC<Props> = ({
  profiles,
  activeIds,
  onToggle,
  profileTimerInfos,
  focusedId,
  onFocus,
}) => {
  if (profiles.length === 0) return null;

  return (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-xs text-muted-foreground font-medium text-center">👀 Who's using screens?</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {profiles.map((p) => {
          const isActive = activeIds.includes(p.id);
          const isFocused = focusedId === p.id;
          const info = profileTimerInfos.find((i) => i.profileId === p.id);
          return (
            <button
              key={p.id}
              onClick={() => {
                if (isActive) {
                  onFocus(p.id);
                } else {
                  onToggle(p.id);
                }
              }}
              onDoubleClick={() => {
                if (isActive) onToggle(p.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                isFocused
                  ? "bg-primary/20 border-primary/60 text-primary shadow-md ring-2 ring-primary/30"
                  : isActive
                  ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
                  : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              <span>{p.avatar}</span>
              <span>{p.name}</span>
              {isActive && info && (
                <span className="text-xs font-medium ml-1 tabular-nums opacity-80">
                  {formatHM(info.effectiveRemaining)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {activeIds.length > 1 && (
        <p className="text-[10px] text-muted-foreground text-center">Tap to view timer · Double-tap to deactivate</p>
      )}
    </div>
  );
};
