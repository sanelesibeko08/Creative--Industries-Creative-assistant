"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Session } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────

export interface UserPreferences {
  preferred_genre: string;
  preferred_tone: string;
  preferred_style: string;
}

interface SessionContextValue {
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  sessions: Session[];
  refreshSessions: () => Promise<void>;
  preferences: UserPreferences;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null);

const DEFAULT_PREFS: UserPreferences = {
  preferred_genre: "fantasy",
  preferred_tone: "neutral",
  preferred_style: "descriptive",
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);

  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = (await res.json()) as { sessions: Session[] };
        setSessions(data.sessions);
      }
    } catch {
      // silently ignore — sidebar just won't update
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/preferences");
      if (res.ok) {
        const data = (await res.json()) as { preferences: UserPreferences };
        setPreferences(data.preferences);
      }
    } catch {
      // use defaults
    }
  }, []);

  const updatePreferences = useCallback(async (patch: Partial<UserPreferences>) => {
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = (await res.json()) as { preferences: UserPreferences };
        setPreferences(data.preferences);
      }
    } catch {
      // optimistic update on failure
      setPreferences((prev) => ({ ...prev, ...patch }));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSessions();
    void fetchPreferences();
  }, [refreshSessions, fetchPreferences]);

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        setCurrentSession,
        sessions,
        refreshSessions,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
