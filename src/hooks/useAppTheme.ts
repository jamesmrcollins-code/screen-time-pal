import { useState, useCallback, useEffect } from "react";

export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  cost: number; // stars to unlock (0 = free/default)
  premium?: boolean; // requires premium subscription in addition to stars
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
      "--background": "200 40% 96%",
      "--card": "200 30% 100%",
      "--primary": "200 80% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "200 25% 92%",
      "--muted": "200 20% 94%",
      "--muted-foreground": "200 15% 45%",
      "--ring": "200 80% 50%",
      "--accent": "170 70% 45%",
      "--accent-foreground": "0 0% 100%",
      "--border": "200 20% 88%",
      "--input": "200 20% 88%",
      "--timer-active": "170 70% 45%",
      "--timer-danger": "0 72% 51%",
      "--timer-track": "200 20% 88%",
    },
    dark: {
      "--background": "200 35% 8%",
      "--card": "200 30% 12%",
      "--primary": "200 80% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "200 25% 16%",
      "--muted": "200 20% 18%",
      "--muted-foreground": "200 15% 55%",
      "--ring": "200 80% 55%",
      "--accent": "170 70% 50%",
      "--accent-foreground": "0 0% 100%",
      "--border": "200 20% 20%",
      "--input": "200 20% 20%",
      "--timer-active": "170 70% 50%",
      "--timer-danger": "0 72% 51%",
      "--timer-track": "200 20% 20%",
    },
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    emoji: "🌅",
    cost: 5,
    light: {
      "--background": "30 40% 96%",
      "--card": "30 30% 100%",
      "--primary": "25 95% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "30 30% 91%",
      "--muted": "30 20% 93%",
      "--muted-foreground": "20 15% 45%",
      "--ring": "25 95% 55%",
      "--accent": "345 80% 58%",
      "--accent-foreground": "0 0% 100%",
      "--border": "30 20% 87%",
      "--input": "30 20% 87%",
      "--timer-active": "150 55% 45%",
      "--timer-danger": "345 80% 58%",
      "--timer-track": "30 20% 87%",
    },
    dark: {
      "--background": "20 35% 7%",
      "--card": "20 30% 11%",
      "--primary": "25 95% 58%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "20 25% 15%",
      "--muted": "20 20% 17%",
      "--muted-foreground": "20 15% 55%",
      "--ring": "25 95% 58%",
      "--accent": "345 80% 62%",
      "--accent-foreground": "0 0% 100%",
      "--border": "20 20% 19%",
      "--input": "20 20% 19%",
      "--timer-active": "150 55% 50%",
      "--timer-danger": "345 80% 62%",
      "--timer-track": "20 20% 19%",
    },
  },
  {
    id: "forest",
    name: "Forest Calm",
    emoji: "🌲",
    cost: 8,
    light: {
      "--background": "140 30% 96%",
      "--card": "140 25% 100%",
      "--primary": "150 55% 40%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "140 22% 91%",
      "--muted": "140 18% 93%",
      "--muted-foreground": "150 12% 42%",
      "--ring": "150 55% 40%",
      "--accent": "80 60% 45%",
      "--accent-foreground": "0 0% 100%",
      "--border": "140 18% 87%",
      "--input": "140 18% 87%",
      "--timer-active": "150 55% 40%",
      "--timer-danger": "0 65% 50%",
      "--timer-track": "140 18% 87%",
    },
    dark: {
      "--background": "150 30% 6%",
      "--card": "150 25% 10%",
      "--primary": "150 55% 48%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "150 22% 14%",
      "--muted": "150 18% 16%",
      "--muted-foreground": "150 12% 52%",
      "--ring": "150 55% 48%",
      "--accent": "80 60% 50%",
      "--accent-foreground": "0 0% 100%",
      "--border": "150 18% 18%",
      "--input": "150 18% 18%",
      "--timer-active": "150 55% 48%",
      "--timer-danger": "0 65% 55%",
      "--timer-track": "150 18% 18%",
    },
  },
  {
    id: "midnight",
    name: "Midnight Gold",
    emoji: "✨",
    cost: 12,
    premium: true,
    light: {
      "--background": "45 30% 96%",
      "--card": "45 25% 100%",
      "--primary": "45 90% 48%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "45 25% 91%",
      "--muted": "45 18% 93%",
      "--muted-foreground": "45 12% 42%",
      "--ring": "45 90% 48%",
      "--accent": "280 60% 55%",
      "--accent-foreground": "0 0% 100%",
      "--border": "45 18% 87%",
      "--input": "45 18% 87%",
      "--timer-active": "160 55% 42%",
      "--timer-danger": "0 70% 52%",
      "--timer-track": "45 18% 87%",
    },
    dark: {
      "--background": "250 25% 7%",
      "--card": "250 22% 11%",
      "--primary": "45 90% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "250 20% 15%",
      "--muted": "250 16% 17%",
      "--muted-foreground": "45 12% 55%",
      "--ring": "45 90% 55%",
      "--accent": "280 60% 60%",
      "--accent-foreground": "0 0% 100%",
      "--border": "250 16% 19%",
      "--input": "250 16% 19%",
      "--timer-active": "160 55% 48%",
      "--timer-danger": "0 70% 55%",
      "--timer-track": "250 16% 19%",
    },
  },
  {
    id: "bubblegum",
    name: "Bubblegum Pop",
    emoji: "🍬",
    cost: 15,
    light: {
      "--background": "330 35% 97%",
      "--card": "330 25% 100%",
      "--primary": "320 75% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "330 25% 92%",
      "--muted": "330 18% 94%",
      "--muted-foreground": "320 12% 45%",
      "--ring": "320 75% 55%",
      "--accent": "280 70% 60%",
      "--accent-foreground": "0 0% 100%",
      "--border": "330 18% 88%",
      "--input": "330 18% 88%",
      "--timer-active": "170 60% 45%",
      "--timer-danger": "0 75% 55%",
      "--timer-track": "330 18% 88%",
    },
    dark: {
      "--background": "320 30% 7%",
      "--card": "320 25% 11%",
      "--primary": "320 75% 60%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "320 22% 15%",
      "--muted": "320 18% 17%",
      "--muted-foreground": "320 12% 55%",
      "--ring": "320 75% 60%",
      "--accent": "280 70% 65%",
      "--accent-foreground": "0 0% 100%",
      "--border": "320 18% 19%",
      "--input": "320 18% 19%",
      "--timer-active": "170 60% 50%",
      "--timer-danger": "0 75% 58%",
      "--timer-track": "320 18% 19%",
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
