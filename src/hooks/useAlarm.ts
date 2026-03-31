import { useRef, useCallback } from "react";

const ALARM_FREQUENCY = 880;
const ALARM_INTERVAL_MS = 600;

export function useAlarm() {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  const startAlarm = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    // Vibrate if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 200, 300, 200, 300]);
    }

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = ALARM_FREQUENCY;
        osc.type = "square";
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      };

      playBeep();
      intervalRef.current = setInterval(() => {
        playBeep();
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 200, 300]);
        }
      }, ALARM_INTERVAL_MS);
    } catch {
      // Audio not supported
    }
  }, []);

  const stopAlarm = useCallback(() => {
    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  return { startAlarm, stopAlarm };
}
