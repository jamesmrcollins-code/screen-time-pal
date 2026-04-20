import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Users, BarChart3, Palette, ListChecks, Calendar, Cloud, Lock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  { icon: Users, label: "Family Sharing" },
  { icon: Sparkles, label: "Unlimited child profiles" },
  { icon: BarChart3, label: "Advanced statistics" },
  { icon: Palette, label: "Theme store" },
  { icon: ListChecks, label: "Bonus tasks & rewards" },
  { icon: Calendar, label: "Custom schedules" },
  { icon: Cloud, label: "Cloud sync" },
  { icon: Lock, label: "PIN locking" },
];

export function PremiumWelcomeDialog({ open, onOpenChange }: Props) {
  const [confetti, setConfetti] = useState<Array<{ x: number; delay: number; emoji: string }>>([]);

  useEffect(() => {
    if (open) {
      const pieces = Array.from({ length: 24 }, (_, i) => ({
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        emoji: ["🎉", "✨", "⭐", "🎊", "👑"][i % 5],
      }));
      setConfetti(pieces);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl overflow-hidden">
        {/* Confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((c, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-[fall_2.2s_ease-in_forwards]"
              style={{
                left: `${c.x}%`,
                top: "-10%",
                animationDelay: `${c.delay}s`,
              }}
            >
              {c.emoji}
            </span>
          ))}
        </div>

        <DialogHeader className="relative z-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-2">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to Premium! 🎉</DialogTitle>
          <DialogDescription className="text-center">
            All premium features are now unlocked on your account.
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 grid grid-cols-2 gap-2 my-2">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <Button onClick={() => onOpenChange(false)} className="relative z-10 w-full h-12 rounded-xl">
          Start exploring
        </Button>

        <style>{`
          @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
