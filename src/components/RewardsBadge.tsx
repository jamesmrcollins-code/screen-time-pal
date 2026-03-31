import React from "react";
import { Star, Flame, Trophy } from "lucide-react";
import type { RewardsData } from "@/hooks/useRewards";

interface Props {
  rewards: RewardsData;
}

export const RewardsBadge: React.FC<Props> = ({ rewards }) => {
  return (
    <div className="flex gap-3 items-center justify-center">
      <div className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5">
        <Flame className="w-4 h-4 text-accent" />
        <span className="text-sm font-bold text-foreground">{rewards.currentStreak}</span>
        <span className="text-xs text-muted-foreground">streak</span>
      </div>
      <div className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5">
        <Star className="w-4 h-4 text-timer-warning" />
        <span className="text-sm font-bold text-foreground">{rewards.totalStars}</span>
        <span className="text-xs text-muted-foreground">stars</span>
      </div>
      {rewards.longestStreak > 2 && (
        <div className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{rewards.longestStreak}</span>
          <span className="text-xs text-muted-foreground">best</span>
        </div>
      )}
    </div>
  );
};
