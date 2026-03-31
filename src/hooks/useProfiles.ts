import { useState, useCallback } from "react";

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string; // emoji
}

const PROFILES_KEY = "screen-timer-profiles";
const ACTIVE_KEY = "screen-timer-active-profile";

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

export function useProfiles() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(loadProfiles);
  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_KEY)
  );

  const activeProfile = profiles.find((p) => p.id === activeId) ?? null;

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
    setActiveId(newProfile.id);
    localStorage.setItem(ACTIVE_KEY, newProfile.id);
    return newProfile;
  }, []);

  const removeProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProfiles(next);
      return next;
    });
    if (activeId === id) {
      setActiveId(null);
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeId]);

  const switchProfile = useCallback((id: string | null) => {
    setActiveId(id);
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }, []);

  return { profiles, activeProfile, activeId, addProfile, removeProfile, switchProfile, DEFAULT_AVATARS };
}
