import { useState, useCallback } from "react";

const PIN_KEY = "screen-timer-pin";

export function usePinLock() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const getStoredPin = (): string | null => localStorage.getItem(PIN_KEY);
  const hasPin = useCallback(() => !!getStoredPin(), []);

  const setPin = useCallback((pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
  }, []);

  const removePin = useCallback(() => {
    localStorage.removeItem(PIN_KEY);
    setIsUnlocked(true);
  }, []);

  const verifyPin = useCallback((pin: string): boolean => {
    const stored = getStoredPin();
    if (!stored) return true;
    const ok = stored === pin;
    if (ok) setIsUnlocked(true);
    return ok;
  }, []);

  const lock = useCallback(() => setIsUnlocked(false), []);

  return { isUnlocked, hasPin, setPin, removePin, verifyPin, lock };
}
