import { useState, useCallback } from "react";

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string; // emoji
}

const PROFILES_KEY = "screen-timer-profiles";
const ACTIVE_IDS_KEY = "screen-timer-active-profiles";

const DEFAULT_AVATARS = ["👧", "👦", "🧒", "👶", "🐱", "🐶", "🦊", "🐻"];

function loadProfiles(): ChildProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: ChildProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function loadActiveIds(): string[] {
  try {
    const raw = localStorage.getItem(ACTIVE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActiveIds(ids: string[]) {
  localStorage.setItem(ACTIVE_IDS_KEY, JSON.stringify(ids));
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(loadProfiles);
  const [activeIds, setActiveIds] = useState<string[]>(loadActiveIds);

  // For backward compat, expose a single activeId (first active or null)
  const activeId = activeIds.length > 0 ? activeIds[0] : null;

  const addProfile = useCallback((name: string) => {
    const newProfile: ChildProfile = {
      id: crypto.randomUUID(),
      name,
      avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    };
    setProfiles((prev) => {
      const next = [...prev, newProfile];
      saveProfiles(next);
      return next;
    });
    // Auto-activate new profile
    setActiveIds((prev) => {
      const next = [...prev, newProfile.id];
      saveActiveIds(next);
      return next;
    });
    return newProfile;
  }, []);

  const removeProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProfiles(next);
      return next;
    });
    setActiveIds((prev) => {
      const next = prev.filter((aid) => aid !== id);
      saveActiveIds(next);
      return next;
    });
  }, []);

  const toggleActiveProfile = useCallback((id: string) => {
    setActiveIds((prev) => {
      const next = prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id];
      saveActiveIds(next);
      return next;
    });
  }, []);

  const switchProfile = useCallback((id: string | null) => {
    if (id) {
      setActiveIds([id]);
      saveActiveIds([id]);
    } else {
      setActiveIds([]);
      saveActiveIds([]);
    }
  }, []);

  return { profiles, activeId, activeIds, addProfile, removeProfile, switchProfile, toggleActiveProfile, DEFAULT_AVATARS };
}
