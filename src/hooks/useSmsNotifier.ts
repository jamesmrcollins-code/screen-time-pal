import { useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { NotificationSettings } from "@/hooks/useNotificationSettings";

const THRESHOLDS = {
  fiveMin: 5 * 60,
  oneMin: 60,
  zero: 0,
} as const;

export function useSmsNotifier(settings: NotificationSettings) {
  const sentRef = useRef<Set<string>>(new Set());

  const resetSent = useCallback(() => {
    sentRef.current.clear();
  }, []);

  const check = useCallback(
    async (remainingSeconds: number) => {
      if (!settings.smsEnabled || !settings.phoneNumber || !settings.twilioFromNumber) return;

      const toSend: { key: string; message: string } | null = (() => {
        if (settings.warnAt5Min && remainingSeconds === THRESHOLDS.fiveMin && !sentRef.current.has("5min")) {
          return { key: "5min", message: "⏰ ScreenTime: 5 minutes of screen time remaining!" };
        }
        if (settings.warnAt1Min && remainingSeconds === THRESHOLDS.oneMin && !sentRef.current.has("1min")) {
          return { key: "1min", message: "⚠️ ScreenTime: Only 1 minute of screen time left!" };
        }
        if (settings.notifyAtZero && remainingSeconds === THRESHOLDS.zero && !sentRef.current.has("zero")) {
          return { key: "zero", message: "🛑 ScreenTime: Screen time is up!" };
        }
        return null;
      })();

      if (!toSend) return;

      sentRef.current.add(toSend.key);

      try {
        const { data, error } = await supabase.functions.invoke("send-sms", {
          body: {
            to: settings.phoneNumber,
            from: settings.twilioFromNumber,
            message: toSend.message,
          },
        });
        if (error) console.warn("SMS send failed:", error);
        else console.log("SMS sent:", data);
      } catch (err) {
        console.warn("SMS send error:", err);
      }
    },
    [settings]
  );

  return { check, resetSent };
}
