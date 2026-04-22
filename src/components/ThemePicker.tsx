import React from "react";
import { Lock, Check, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_THEMES } from "@/hooks/useAppTheme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalStars: number;
  activeThemeId: string;
  isUnlocked: (id: string) => boolean;
  unlockTheme: (id: string) => boolean;
  setActiveTheme: (id: string) => void;
  isPremium: boolean;
}

export const ThemePicker: React.FC<Props> = ({
  open,
  onOpenChange,
  totalStars,
  activeThemeId,
  isUnlocked,
  unlockTheme,
  setActiveTheme,
  isPremium,
}) => {
  const navigate = useNavigate();

  const handleSelect = (themeId: string) => {
    const theme = APP_THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    if (theme.premium && !isPremium) {
      onOpenChange(false);
      navigate("/pricing");
      return;
    }

    if (isUnlocked(themeId)) {
      setActiveTheme(themeId);
      toast.success(`${theme.emoji} ${theme.name} applied!`);
    } else if (totalStars >= theme.cost) {
      const success = unlockTheme(themeId);
      if (success) {
        setActiveTheme(themeId);
        toast.success(`🎉 Unlocked ${theme.name}!`);
      }
    } else {
      toast.error(`You need ${theme.cost} stars to unlock this theme. You have ${totalStars}.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">🎨 Theme Store</DialogTitle>
          <DialogDescription className="text-center">
            Spend your stars to unlock new themes!
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-4 h-4 text-timer-warning" />
          <span className="text-sm font-bold text-foreground">{totalStars} stars available</span>
        </div>

        <div className="space-y-2">
          {APP_THEMES.map((theme) => {
            const unlocked = isUnlocked(theme.id);
            const active = activeThemeId === theme.id;
            const canAfford = totalStars >= theme.cost;
            const premiumLocked = !!theme.premium && !isPremium;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  active
                    ? "border-primary bg-primary/10"
                    : premiumLocked
                    ? "border-border bg-muted/50 opacity-70 hover:border-primary/40"
                    : unlocked
                    ? "border-border bg-card hover:border-primary/40"
                    : canAfford
                    ? "border-border bg-card hover:border-primary/40"
                    : "border-border bg-muted/50 opacity-60"
                }`}
              >
                <span className="text-2xl">{theme.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    {theme.name}
                    {theme.premium && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        <Crown className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                  </p>
                  {premiumLocked ? (
                    <p className="text-xs text-muted-foreground mt-0.5">Tap to upgrade</p>
                  ) : !unlocked && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-timer-warning" />
                      <span className="text-xs text-muted-foreground">{theme.cost} stars</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {active ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : premiumLocked ? (
                    <Crown className="w-4 h-4 text-primary" />
                  ) : unlocked ? (
                    <span className="text-xs text-muted-foreground">Tap to use</span>
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
