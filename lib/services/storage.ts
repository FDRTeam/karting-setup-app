import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KartingSession } from "@/lib/types";

const SESSIONS_KEY = "karting_sessions";
const CURRENT_SESSION_KEY = "current_session";

/**
 * Save a karting session to local storage
 */
export async function saveSession(session: KartingSession): Promise<void> {
  try {
    const sessions = await getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save session:", error);
    throw error;
  }
}

/**
 * Get all saved sessions
 */
export async function getAllSessions(): Promise<KartingSession[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get sessions:", error);
    return [];
  }
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string): Promise<KartingSession | null> {
  try {
    const sessions = await getAllSessions();
    return sessions.find((s) => s.id === id) || null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<void> {
  try {
    const sessions = await getAllSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete session:", error);
    throw error;
  }
}

/**
 * Save current working session (draft)
 */
export async function saveCurrentSession(
  session: Partial<KartingSession>
): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save current session:", error);
    throw error;
  }
}

/**
 * Get current working session (draft)
 */
export async function getCurrentSession(): Promise<Partial<KartingSession> | null> {
  try {
    const data = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get current session:", error);
    return null;
  }
}

/**
 * Clear current working session
 */
export async function clearCurrentSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear current session:", error);
    throw error;
  }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
