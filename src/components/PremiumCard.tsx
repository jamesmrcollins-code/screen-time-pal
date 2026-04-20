import { Crown, Sparkles, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

export function PremiumCard() {
  const navigate = useNavigate();
  const { isPremium, hasLifetime, subscription, loading } = useSubscription();

  if (loading) return null;

  if (isPremium) {
    return (
      <button
        onClick={() => navigate("/pricing")}
        className="w-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-4 text-left hover:border-primary/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground flex items-center gap-1">
              {hasLifetime ? "Lifetime Premium" : "Premium active"}
              <Check className="w-3.5 h-3.5 text-primary" />
            </p>
            <p className="text-xs text-muted-foreground">
              {hasLifetime
                ? "All features unlocked forever"
                : subscription?.cancel_at_period_end
                ? `Ends ${new Date(subscription.current_period_end!).toLocaleDateString()}`
                : "Tap to manage your plan"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/pricing")}
      className="w-full bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-5 text-left text-primary-foreground hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold flex items-center gap-2">
            Upgrade to Premium
          </p>
          <p className="text-xs opacity-90 mt-0.5">
            Family Sharing, unlimited profiles, advanced stats & more
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
            <span>From £4.99/month</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </button>
  );
}
