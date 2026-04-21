import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumGateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Render children dimmed behind a locked overlay instead of replacing them */
  preview?: boolean;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  title,
  description,
  icon,
  children,
  preview = false,
}) => {
  const { isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading || isPremium) return <>{children}</>;

  const lockedCard = (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icon ?? <Lock className="w-4 h-4 text-muted-foreground" />}
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <Lock className="w-3 h-3" /> Premium
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button
        onClick={() => navigate("/pricing")}
        className="w-full h-10 rounded-xl gap-2"
        size="sm"
      >
        <Crown className="w-4 h-4" />
        Upgrade to unlock
      </Button>
    </div>
  );

  if (!preview) return lockedCard;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-xs w-full">{lockedCard}</div>
      </div>
    </div>
  );
};