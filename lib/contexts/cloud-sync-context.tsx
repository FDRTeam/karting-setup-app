"use client";

import { createContext, useCallback, useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KartingSession } from "@/lib/types";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

interface CloudSyncContextType {
  // State
  sessions: KartingSession[];
  isLoading: boolean;
  isSyncing: boolean;
  syncError: string | null;

  // Methods
  loadSessions: () => Promise<void>;
  saveSession: (session: KartingSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<KartingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // tRPC mutations
  const saveMutation = trpc.setup.save.useMutation();
  const deleteMutation = trpc.setup.delete.useMutation();
  const getAllQuery = trpc.setup.getAll.useQuery(undefined, {
    enabled: false,
  });

  /**
   * Load sessions from local storage
   */
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem("karting_sessions");
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("[CloudSync] Error loading sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save a session to local storage and cloud
   */
  const saveSession = useCallback(
    async (session: KartingSession) => {
      try {
        // Update local state
        setSessions((prev) => {
          const existing = prev.findIndex((s) => s.id === session.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = session;
            return updated;
          }
          return [...prev, session];
        });

        // Save to local storage
        const updated = sessions.map((s) => (s.id === session.id ? session : s));
        if (!sessions.find((s) => s.id === session.id)) {
          updated.push(session);
        }
        await AsyncStorage.setItem("karting_sessions", JSON.stringify(updated));

        // Try to sync to cloud if authenticated
        if (isAuthenticated) {
          try {
            await saveMutation.mutateAsync({
              setup: JSON.stringify(session),
              trackName: session.trackName || "Unknown",
              date: new Date().toISOString(),
            });
          } catch (error) {
            console.warn("[CloudSync] Failed to sync to cloud, will retry later:", error);
          }
        }
      } catch (error) {
        console.error("[CloudSync] Error saving session:", error);
        throw error;
      }
    },
    [sessions, isAuthenticated, saveMutation]
  );

  /**
   * Delete a session from local storage and cloud
   */
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        // Update local state
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));

        // Remove from local storage
        const updated = sessions.filter((s) => s.id !== sessionId);
        await AsyncStorage.setItem("karting_sessions", JSON.stringify(updated));

        // Try to delete from cloud if authenticated
        if (isAuthenticated) {
          try {
            const session = sessions.find((s) => s.id === sessionId);
            if (session?.cloudId) {
              await deleteMutation.mutateAsync({ id: String(session.cloudId) });
            }
          } catch (error) {
            console.warn("[CloudSync] Failed to delete from cloud:", error);
          }
        }
      } catch (error) {
        console.error("[CloudSync] Error deleting session:", error);
        throw error;
      }
    },
    [sessions, isAuthenticated, deleteMutation]
  );

  /**
   * Sync all local sessions to cloud
   */
  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated) {
      setSyncError("Not authenticated. Please log in first.");
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      for (const session of sessions) {
        try {
          await saveMutation.mutateAsync({
            setup: JSON.stringify(session),
            trackName: session.trackName || "Unknown",
            date: new Date().toISOString(),
          });
        } catch (error) {
          console.warn("[CloudSync] Failed to sync session:", session.id, error);
        }
      }

      console.log("[CloudSync] Sync to cloud completed");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setSyncError(errorMsg);
      console.error("[CloudSync] Error syncing to cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [sessions, isAuthenticated, saveMutation]);

  /**
   * Sync all cloud sessions to local storage
   */
  const syncFromCloud = useCallback(async () => {
    if (!isAuthenticated) {
      setSyncError("Not authenticated. Please log in first.");
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      const response = await getAllQuery.refetch();

      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error(response.data?.error || "Failed to fetch setups from cloud");
      }

      const cloudSessions: KartingSession[] = response.data.data.map((item: any) => ({
        ...JSON.parse(item.setup),
        cloudId: item.id,
        syncedAt: item.createdAt,
      }));

      setSessions(cloudSessions);
      await AsyncStorage.setItem("karting_sessions", JSON.stringify(cloudSessions));

      console.log("[CloudSync] Sync from cloud completed");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setSyncError(errorMsg);
      console.error("[CloudSync] Error syncing from cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, getAllQuery]);

  /**
   * Load sessions on mount
   */
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <CloudSyncContext.Provider
      value={{
        sessions,
        isLoading,
        isSyncing,
        syncError,
        loadSessions,
        saveSession,
        deleteSession,
        syncToCloud,
        syncFromCloud,
      }}
    >
      {children}
    </CloudSyncContext.Provider>
  );
}

export function useCloudSync(): CloudSyncContextType {
  const context = useContext(CloudSyncContext);
  if (!context) {
    throw new Error("useCloudSync must be used within CloudSyncProvider");
  }
  return context;
}
