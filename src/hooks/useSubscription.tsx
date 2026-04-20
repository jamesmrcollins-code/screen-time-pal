import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPaymentEnvironment } from "@/lib/paddle";

interface SubscriptionRow {
  status: string;
  price_id: string;
  product_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
}

interface LifetimeRow {
  price_id: string;
  environment: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [lifetime, setLifetime] = useState<LifetimeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const env = getPaymentEnvironment();

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLifetime(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [subRes, lifeRes] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("environment", env).maybeSingle(),
      supabase.from("lifetime_purchases").select("*").eq("user_id", user.id).eq("environment", env).maybeSingle(),
    ]);
    setSubscription(subRes.data as SubscriptionRow | null);
    setLifetime(lifeRes.data as LifetimeRow | null);
    setLoading(false);
  }, [user, env]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`sub-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "lifetime_purchases", filter: `user_id=eq.${user.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refresh]);

  const hasLifetime = !!lifetime;
  const subActive = subscription
    ? ["active", "trialing"].includes(subscription.status) &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())
    : false;

  const isPremium = hasLifetime || subActive;

  return {
    subscription,
    lifetime,
    isPremium,
    hasLifetime,
    loading,
    environment: env,
    refresh,
  };
}
