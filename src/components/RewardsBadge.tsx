import React, { useState } from "react";
import { Star, Flame, Trophy } from "lucide-react";
import type { RewardsData } from "@/hooks/useRewards";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  rewards: RewardsData;
}

const explanations = {
  streak: {
    icon: <Flame className="w-6 h-6 text-accent" />,
    title: "Daily Streak",
    description:
      "Your streak counts consecutive days where your screen time stayed within your set limit. If you go over your limit or skip a day, the streak resets to zero. Days with no limit set count as a free pass!",
  },
  stars: {
    icon: <Star className="w-6 h-6 text-timer-warning" />,
    title: "Stars",
    description:
      "You earn 1 star for every 5 days you stay within your screen time limit. Spend stars in the Theme Store (🎨) to unlock new color themes!",
  },
  best: {
    icon: <Trophy className="w-6 h-6 text-primary" />,
    title: "Best Streak",
    description:
      "This is the longest consecutive streak you've ever achieved. Can you beat your personal best?",
  },
};

type ExplanationKey = keyof typeof explanations;

export const RewardsBadge: React.FC<Props> = ({ rewards }) => {
  const [open, setOpen] = useState<ExplanationKey | null>(null);

  const current = open ? explanations[open] : null;

  return (
    <>
      <div className="flex gap-3 items-center justify-center">
        <button
          onClick={() => setOpen("streak")}
          className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <Flame className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-foreground">{rewards.currentStreak}</span>
          <span className="text-xs text-muted-foreground">streak</span>
        </button>
        <button
          onClick={() => setOpen("stars")}
          className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <Star className="w-4 h-4 text-timer-warning" />
          <span className="text-sm font-bold text-foreground">{rewards.totalStars}</span>
          <span className="text-xs text-muted-foreground">stars</span>
        </button>
        {rewards.longestStreak > 2 && (
          <button
            onClick={() => setOpen("best")}
            className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{rewards.longestStreak}</span>
            <span className="text-xs text-muted-foreground">best</span>
          </button>
        )}
      </div>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader className="items-center text-center">
            {current && (
              <>
                <div className="mb-2">{current.icon}</div>
                <DialogTitle>{current.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-2">
                  {current.description}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
