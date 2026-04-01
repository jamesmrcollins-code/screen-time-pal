import { useState, useCallback, useEffect } from "react";

export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  cost: number; // stars to unlock (0 = free/default)
  light: Record<string, string>;
  dark: Record<string, string>;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "default",
    name: "Purple Dream",
    emoji: "💜",
    cost: 0,
    light: {}, // uses index.css defaults
    dark: {},
  },
  {
    id: "ocean",
    name: "Ocean Wave",
    emoji: "🌊",
    cost: 3,
    light: {
      "--primary": "200 80% 50%",
      "--ring": "200 80% 50%",
      "--accent": "170 70% 45%",
      "--timer-active": "170 70% 45%",
      "--timer-danger": "0 72% 51%",
    },
    dark: {
      "--primary": "200 80% 55%",
      "--ring": "200 80% 55%",
      "--accent": "170 70% 50%",
      "--timer-active": "170 70% 50%",
      "--timer-danger": "0 72% 51%",
    },
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    emoji: "🌅",
    cost: 5,
    light: {
      "--primary": "25 95% 55%",
      "--ring": "25 95% 55%",
      "--accent": "345 80% 58%",
      "--timer-active": "150 55% 45%",
      "--timer-danger": "345 80% 58%",
    },
    dark: {
      "--primary": "25 95% 58%",
      "--ring": "25 95% 58%",
      "--accent": "345 80% 62%",
      "--timer-active": "150 55% 50%",
      "--timer-danger": "345 80% 62%",
    },
  },
  {
    id: "forest",
    name: "Forest Calm",
    emoji: "🌲",
    cost: 8,
    light: {
      "--primary": "150 55% 40%",
      "--ring": "150 55% 40%",
      "--accent": "80 60% 45%",
      "--timer-active": "150 55% 40%",
      "--timer-danger": "0 65% 50%",
    },
    dark: {
      "--primary": "150 55% 48%",
      "--ring": "150 55% 48%",
      "--accent": "80 60% 50%",
      "--timer-active": "150 55% 48%",
      "--timer-danger": "0 65% 55%",
    },
  },
  {
    id: "midnight",
    name: "Midnight Gold",
    emoji: "✨",
    cost: 12,
    light: {
      "--primary": "45 90% 48%",
      "--ring": "45 90% 48%",
      "--accent": "280 60% 55%",
      "--timer-active": "160 55% 42%",
      "--timer-danger": "0 70% 52%",
    },
    dark: {
      "--primary": "45 90% 55%",
      "--ring": "45 90% 55%",
      "--accent": "280 60% 60%",
      "--timer-active": "160 55% 48%",
      "--timer-danger": "0 70% 55%",
    },
  },
  {
    id: "bubblegum",
    name: "Bubblegum Pop",
    emoji: "🍬",
    cost: 15,
    light: {
      "--primary": "320 75% 55%",
      "--ring": "320 75% 55%",
      "--accent": "280 70% 60%",
      "--timer-active": "170 60% 45%",
      "--timer-danger": "0 75% 55%",
    },
    dark: {
      "--primary": "320 75% 60%",
      "--ring": "320 75% 60%",
      "--accent": "280 70% 65%",
      "--timer-active": "170 60% 50%",
      "--timer-danger": "0 75% 58%",
    },
  },
];

const THEME_STORAGE_KEY = "screen-timer-theme";
const UNLOCKED_KEY = "screen-timer-unlocked-themes";

interface ThemeStore {
  activeThemeId: string;
  unlockedIds: string[];
}

function loadStore(): ThemeStore {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { activeThemeId: "default", unlockedIds: ["default"] };
  } catch {
    return { activeThemeId: "default", unlockedIds: ["default"] };
  }
}

function saveStore(store: ThemeStore) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(store));
}

function applyThemeVars(theme: AppTheme) {
  const isDark = document.documentElement.classList.contains("dark");
  const vars = isDark ? theme.dark : theme.light;

  // Reset to defaults by removing custom properties (CSS will fall back to index.css)
  const allKeys = new Set<string>();
  APP_THEMES.forEach((t) => {
    Object.keys(t.light).forEach((k) => allKeys.add(k));
    Object.keys(t.dark).forEach((k) => allKeys.add(k));
  });
  allKeys.forEach((k) => document.documentElement.style.removeProperty(k));

  // Apply new theme vars
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

export function useAppTheme(totalStars: number) {
  const [store, setStore] = useState<ThemeStore>(loadStore);

  // Apply theme on mount & changes
  useEffect(() => {
    const theme = APP_THEMES.find((t) => t.id === store.activeThemeId) ?? APP_THEMES[0];
    applyThemeVars(theme);
  }, [store.activeThemeId]);

  // Re-apply when dark/light toggles
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = APP_THEMES.find((t) => t.id === store.activeThemeId) ?? APP_THEMES[0];
      applyThemeVars(theme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [store.activeThemeId]);

  // Persist
  useEffect(() => {
    saveStore(store);
  }, [store]);

  const unlockTheme = useCallback(
    (themeId: string): boolean => {
      const theme = APP_THEMES.find((t) => t.id === themeId);
      if (!theme) return false;
      if (store.unlockedIds.includes(themeId)) return false;
      if (totalStars < theme.cost) return false;
      setStore((prev) => ({
        ...prev,
        unlockedIds: [...prev.unlockedIds, themeId],
      }));
      return true;
    },
    [store.unlockedIds, totalStars]
  );

  const setActiveTheme = useCallback((themeId: string) => {
    setStore((prev) => {
      if (!prev.unlockedIds.includes(themeId)) return prev;
      return { ...prev, activeThemeId: themeId };
    });
  }, []);

  const isUnlocked = useCallback(
    (themeId: string) => store.unlockedIds.includes(themeId),
    [store.unlockedIds]
  );

  const setFromCloud = useCallback((cloudData: { unlockedIds: string[]; activeThemeId: string }) => {
    setStore({ activeThemeId: cloudData.activeThemeId, unlockedIds: cloudData.unlockedIds });
  }, []);

  return {
    activeThemeId: store.activeThemeId,
    unlockedIds: store.unlockedIds,
    unlockTheme,
    setActiveTheme,
    isUnlocked,
    themes: APP_THEMES,
    setThemeFromCloud: setFromCloud,
  };
}
