import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProfiles } from "@/hooks/useProfiles";
import { useUsageLog } from "@/hooks/useUsageLog";
import { Minus, Plus, Clock } from "lucide-react";
import { toast } from "sonner";

const PRESET_MINUTES = [5, 10, 15, 30, 45, 60];

export function AdjustTime() {
  const { profiles } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles[0]?.id ?? null
  );
  const [minutes, setMinutes] = useState(15);
  const { addUsage } = useUsageLog(selectedProfileId);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const handleDeduct = () => {
    if (!selectedProfileId) return;
    addUsage(minutes * 60);
    toast.success(
      `Deducted ${minutes} min from ${selectedProfile?.avatar ?? ""} ${selectedProfile?.name ?? "profile"}'s time today`
    );
  };

  if (profiles.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <Clock className="w-5 h-5" /> Adjust Time
      </h2>
      <p className="text-xs text-muted-foreground mb-3">
        Deduct time if a child used screen time elsewhere (e.g. TV, tablet).
      </p>

      {profiles.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setSelectedProfileId(profile.id)}
              aria-pressed={selectedProfileId === profile.id}
              className={`px-3 py-2 rounded-full text-xs font-semibold border-2 shadow-sm transition-all duration-150 active:scale-95 ${
                selectedProfileId === profile.id
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/25 shadow-md"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {profile.avatar} {profile.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => setMinutes((m) => Math.max(5, m - 5))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-2xl font-bold text-foreground min-w-[4ch] text-center">
          {minutes}<span className="text-sm font-normal text-muted-foreground ml-1">min</span>
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => setMinutes((m) => m + 5)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {PRESET_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              minutes === m
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <Button onClick={handleDeduct} variant="default" className="w-full rounded-xl">
        Deduct {minutes} min from {selectedProfile?.avatar} {selectedProfile?.name}
      </Button>
    </div>
  );
}
