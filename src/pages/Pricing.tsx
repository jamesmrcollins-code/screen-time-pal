import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Check, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PremiumWelcomeDialog } from "@/components/PremiumWelcomeDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLANS = [
  {
    id: "premium_monthly",
    name: "Monthly",
    price: "£4.99",
    period: "/month",
    badge: null,
    description: "Cancel anytime",
  },
  {
    id: "premium_yearly",
    name: "Yearly",
    price: "£39.99",
    period: "/year",
    badge: "Save 33%",
    description: "Best value",
  },
  {
    id: "premium_lifetime",
    name: "Lifetime",
    price: "£79.99",
    period: "one-time",
    badge: "Pay once",
    description: "Yours forever",
  },
];

const FEATURES = [
  "Family Sharing — invite a co-parent",
  "Unlimited child profiles",
  "Advanced statistics & history",
  "Theme store with all themes",
  "Bonus tasks & chore rewards",
  "Custom daily schedules",
  "Cloud sync across devices",
  "PIN locking for settings",
];

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isPremium, subscription, hasLifetime, loading } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome dialog after successful checkout
  useEffect(() => {
    if (searchParams.get("checkout") === "success" && isPremium) {
      setShowWelcome(true);
      const next = new URLSearchParams(searchParams);
      next.delete("checkout");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, isPremium, setSearchParams]);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error || !data?.url) throw new Error("Could not open portal");
      window.open(data.url, "_blank");
    } catch (e) {
      toast.error("Could not open subscription manager");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Premium</h1>
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Unlock Everything</h2>
          <p className="text-sm text-muted-foreground">
            Get all premium features for your whole family.
          </p>
        </div>

        {/* Current status */}
        {isPremium && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">
                {hasLifetime ? "Lifetime Premium active" : "Premium active"}
              </span>
            </div>
            {subscription?.cancel_at_period_end && subscription.current_period_end && (
              <p className="text-xs text-muted-foreground">
                Access ends {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            {!hasLifetime && (
              <Button
                onClick={handleManage}
                disabled={portalLoading}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Manage subscription"}
              </Button>
            )}
          </div>
        )}

        {/* Features */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">What's included</h3>
          <ul className="space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plans */}
        {!hasLifetime && (
          <div className="space-y-3">
            {PLANS.map((plan) => {
              const isCurrent = subscription?.price_id === plan.id && !subscription?.cancel_at_period_end;
              return (
                <button
                  key={plan.id}
                  onClick={() => !isCurrent && openCheckout(plan.id)}
                  disabled={loading || checkoutLoading || isCurrent || !user}
                  className={`w-full text-left bg-card border-2 rounded-2xl p-4 transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground">{plan.name}</span>
                        {plan.badge && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{plan.price}</div>
                      <div className="text-xs text-muted-foreground">{plan.period}</div>
                    </div>
                  </div>
                  {isCurrent && (
                    <p className="text-xs text-primary font-semibold mt-2">✓ Current plan</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!user && (
          <p className="text-center text-xs text-muted-foreground">
            <Button variant="link" onClick={() => navigate("/auth")} className="p-0 h-auto">
              Sign in
            </Button>{" "}
            to upgrade
          </p>
        )}

        <p className="text-center text-[11px] text-muted-foreground px-4">
          Payments are processed securely. Cancel anytime — you'll keep access until the end of your billing period.
        </p>
      </div>

      <PremiumWelcomeDialog open={showWelcome} onOpenChange={setShowWelcome} />
    </div>
  );
}
