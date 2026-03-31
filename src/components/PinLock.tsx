import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface PinLockProps {
  hasPin: boolean;
  isUnlocked: boolean;
  onVerify: (pin: string) => boolean;
  onSetPin: (pin: string) => void;
  onRemovePin: () => void;
  onLock: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({
  hasPin, isUnlocked, onVerify, onSetPin, onRemovePin, onLock,
}) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"idle" | "enter" | "set">("idle");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (mode === "set") {
      if (input.length < 4) { setError("PIN must be 4+ digits"); return; }
      onSetPin(input);
      setInput("");
      setMode("idle");
      setError("");
    } else {
      if (!onVerify(input)) { setError("Wrong PIN"); setInput(""); return; }
      setInput("");
      setMode("idle");
      setError("");
    }
  };

  if (!hasPin && mode === "idle") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground font-medium">Parent PIN Lock</span>
        <Button variant="secondary" size="sm" onClick={() => setMode("set")} className="rounded-full">
          <Lock className="w-3.5 h-3.5 mr-1" /> Set PIN
        </Button>
      </div>
    );
  }

  if (hasPin && isUnlocked && mode === "idle") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary font-medium flex items-center gap-1">
          <Unlock className="w-3.5 h-3.5" /> Unlocked
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onLock} className="rounded-full text-xs">Lock</Button>
          <Button variant="ghost" size="sm" onClick={onRemovePin} className="rounded-full text-xs text-destructive">Remove</Button>
        </div>
      </div>
    );
  }

  if (hasPin && !isUnlocked && mode === "idle") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" /> Locked
        </span>
        <Button variant="secondary" size="sm" onClick={() => setMode("enter")} className="rounded-full">
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-foreground font-medium">
        {mode === "set" ? "Create a 4-digit PIN" : "Enter PIN to unlock"}
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={input}
          onChange={(e) => { setInput(e.target.value.replace(/\D/g, "")); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 h-9 rounded-lg border border-input bg-secondary px-3 text-center text-lg tracking-[0.5em] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••"
          autoFocus
        />
        <Button size="sm" onClick={handleSubmit} className="rounded-lg">OK</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMode("idle"); setError(""); setInput(""); }} className="rounded-lg">✕</Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
