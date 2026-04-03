import { format } from "date-fns";

const RESET_DAYS_KEY = "screen-timer-reset-days";

function loadResetDays(): string[] {
  try {
    const raw = localStorage.getItem(RESET_DAYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveResetDays(days: string[]) {
  localStorage.setItem(RESET_DAYS_KEY, JSON.stringify(days));
}

/** Mark today as a reset-after-zero day (no streak credit). */
export function markResetDay() {
  const today = format(new Date(), "yyyy-MM-dd");
  const days = loadResetDays();
  if (!days.includes(today)) {
    days.push(today);
    saveResetDays(days);
  }
}

/** Check if a given date was a reset-after-zero day. */
export function isResetDay(dateStr: string): boolean {
  return loadResetDays().includes(dateStr);
}

/** Get all reset days. */
export function getResetDays(): string[] {
  return loadResetDays();
}
