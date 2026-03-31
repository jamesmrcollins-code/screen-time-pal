import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Volume2 } from "lucide-react";

interface TimesUpLockScreenProps {
  onUnlock: () => void;
  verifyPin: (pin: string) => boolean;
  hasAlarm: boolean;
  onStopAlarm: () => void;
}

export const TimesUpLockScreen: React.FC<TimesUpLockScreenProps> = ({
  onUnlock,
  verifyPin,
  hasAlarm,
  onStopAlarm,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (verifyPin(pin)) {
      onStopAlarm();
      onUnlock();
    } else {
      setError("Wrong PIN");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-6 p-8">
      <div className="animate-pulse">
        <Lock className="w-16 h-16 text-destructive" />
      </div>

      <h2 className="text-2xl font-extrabold text-foreground text-center">
        ⏰ Screen Time's Up!
      </h2>
      <p className="text-muted-foreground text-center max-w-xs">
        The screen is locked. A parent must enter the PIN to unlock.
      </p>

      {hasAlarm && (
        <Button
          variant="outline"
          size="sm"
          onClick={onStopAlarm}
          className="rounded-full gap-2"
        >
          <Volume2 className="w-4 h-4" />
          Stop Alarm
        </Button>
      )}

      <div className="w-full max-w-xs space-y-3">
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full h-12 rounded-xl border border-input bg-secondary px-4 text-center text-2xl tracking-[0.5em] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••"
          autoFocus
        />
        <Button onClick={handleSubmit} className="w-full rounded-xl h-12 text-base font-semibold">
          Unlock
        </Button>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>
    </div>
  );
};
