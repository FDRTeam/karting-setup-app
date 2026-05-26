import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { KartingSession } from "@/lib/types";
import {
  saveSession,
  getAllSessions,
  deleteSession,
  generateSessionId,
  saveCurrentSession,
  getCurrentSession,
  clearCurrentSession,
} from "@/lib/services/storage";

interface SessionContextType {
  sessions: KartingSession[];
  currentSession: Partial<KartingSession> | null;
  loading: boolean;
  error: string | null;
  createSession: (trackName: string, location: { lat: number; lng: number }) => Promise<void>;
  updateCurrentSession: (updates: Partial<KartingSession>) => Promise<void>;
  saveCurrentSessionAsFinal: () => Promise<void>;
  loadSessions: () => Promise<void>;
  deleteSessionById: (id: string) => Promise<void>;
  clearCurrent: () => Promise<void>;
  addSession: (session: KartingSession) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

type SessionAction =
  | { type: "SET_SESSIONS"; payload: KartingSession[] }
  | { type: "SET_CURRENT"; payload: Partial<KartingSession> | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_SESSION"; payload: KartingSession }
  | { type: "REMOVE_SESSION"; payload: string };

interface SessionState {
  sessions: KartingSession[];
  currentSession: Partial<KartingSession> | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "SET_CURRENT":
      return { ...state, currentSession: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_SESSION":
      return { ...state, sessions: [...state.sessions, action.payload] };
    case "REMOVE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
      };
    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const loadSessions = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const sessions = await getAllSessions();
      dispatch({ type: "SET_SESSIONS", payload: sessions });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to load sessions",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const loadCurrentSession = useCallback(async () => {
    try {
      const current = await getCurrentSession();
      dispatch({ type: "SET_CURRENT", payload: current });
    } catch (error) {
      console.error("Failed to load current session:", error);
    }
  }, []);

  const createSession = useCallback(async (
    trackName: string,
    location: { lat: number; lng: number }
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const newSession: Partial<KartingSession> = {
        id: generateSessionId(),
        trackName,
        trackLocation: {
          latitude: location.lat,
          longitude: location.lng,
        },
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: "SET_CURRENT", payload: newSession });
      await saveCurrentSession(newSession);
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to create session",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const updateCurrentSession = useCallback(async (updates: Partial<KartingSession>) => {
    try {
      const updated = {
        ...state.currentSession,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "SET_CURRENT", payload: updated });
      await saveCurrentSession(updated);
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to update session",
      });
    }
  }, [state.currentSession]);

  const saveCurrentSessionAsFinal = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      if (!state.currentSession || !state.currentSession.id) {
        throw new Error("No current session to save");
      }

      const finalSession = state.currentSession as KartingSession;
      await saveSession(finalSession);
      dispatch({ type: "ADD_SESSION", payload: finalSession });
      await clearCurrentSession();
      dispatch({ type: "SET_CURRENT", payload: null });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to save session",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const deleteSessionById = useCallback(async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await deleteSession(id);
      dispatch({ type: "REMOVE_SESSION", payload: id });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to delete session",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const clearCurrent = useCallback(async () => {
    try {
      await clearCurrentSession();
      dispatch({ type: "SET_CURRENT", payload: null });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to clear session",
      });
    }
  }, []);

  const addSession = useCallback(async (session: KartingSession) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await saveSession(session);
      dispatch({ type: "ADD_SESSION", payload: session });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to add session",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadCurrentSession();
  }, [loadSessions, loadCurrentSession]);

  const value: SessionContextType = {
    sessions: state.sessions,
    currentSession: state.currentSession,
    loading: state.loading,
    error: state.error,
    createSession,
    updateCurrentSession,
    saveCurrentSessionAsFinal,
    loadSessions,
    deleteSessionById,
    clearCurrent,
    addSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
