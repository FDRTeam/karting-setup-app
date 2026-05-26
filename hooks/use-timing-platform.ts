import { useState, useCallback, useEffect } from 'react';
import { TimingPlatformFactory, type TimingPlatformIntegration } from '@/lib/services/timing-platform-factory';
import type {
  TimingPlatformType,
  TimingPlatformCredentials,
  LiveEventData,
  LiveLapData,
} from '@/lib/services/timing-platform-registry';
import { validateCredentials } from '@/lib/services/timing-platform-registry';
import * as SecureStore from 'expo-secure-store';

/**
 * Hook for managing timing platform connections and live lap data
 */
export function useTimingPlatform() {
  const [factory] = useState(() => new TimingPlatformFactory());
  const [selectedPlatform, setSelectedPlatform] = useState<TimingPlatformType | null>(null);
  const [integration, setIntegration] = useState<TimingPlatformIntegration | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  // Load saved platform preference on mount
  useEffect(() => {
    loadSavedPlatform();
  }, []);

  /**
   * Load saved platform preference from storage
   */
  const loadSavedPlatform = useCallback(async () => {
    try {
      const saved = await SecureStore.getItemAsync('timing_platform_selected');
      if (saved) {
        setSelectedPlatform(saved as TimingPlatformType);
      }
    } catch (err) {
      console.error('Failed to load saved platform:', err);
    }
  }, []);

  /**
   * Connect to a timing platform
   */
  const connect = useCallback(
    async (platformId: TimingPlatformType, creds: Record<string, string>) => {
      setIsConnecting(true);
      setError(null);

      try {
        // Validate credentials
        const validation = validateCredentials(platformId, creds);
        if (!validation.valid) {
          setError(validation.errors.join(', '));
          setIsConnecting(false);
          return false;
        }

        // Create integration
        const newIntegration = factory.createIntegration(platformId);
        const connected = await newIntegration.connect(creds);

        if (connected) {
          setSelectedPlatform(platformId);
          setIntegration(newIntegration);
          setIsConnected(true);
          setCredentials(creds);

          // Save platform preference
          await SecureStore.setItemAsync('timing_platform_selected', platformId);

          // Save credentials securely
          await SecureStore.setItemAsync(
            `timing_platform_creds_${platformId}`,
            JSON.stringify(creds)
          );

          return true;
        } else {
          setError('Failed to connect to platform');
          setIsConnecting(false);
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Connection failed';
        setError(message);
        setIsConnecting(false);
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [factory]
  );

  /**
   * Disconnect from current platform
   */
  const disconnect = useCallback(async () => {
    if (integration) {
      await integration.disconnect();
    }
    setIntegration(null);
    setSelectedPlatform(null);
    setIsConnected(false);
    setCredentials({});
    setError(null);
  }, [integration]);

  /**
   * Get live events from current platform
   */
  const getEvents = useCallback(async (): Promise<LiveEventData[]> => {
    if (!integration || !isConnected) {
      setError('Not connected to a timing platform');
      return [];
    }

    try {
      return await integration.getEvents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
      return [];
    }
  }, [integration, isConnected]);

  /**
   * Get event details
   */
  const getEventDetails = useCallback(
    async (eventId: string): Promise<LiveEventData | null> => {
      if (!integration || !isConnected) {
        setError('Not connected to a timing platform');
        return null;
      }

      try {
        return await integration.getEventDetails(eventId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch event details';
        setError(message);
        return null;
      }
    },
    [integration, isConnected]
  );

  /**
   * Get lap data for a participant
   */
  const getLapData = useCallback(
    async (eventId: string, participantId: string): Promise<LiveLapData[]> => {
      if (!integration || !isConnected) {
        setError('Not connected to a timing platform');
        return [];
      }

      try {
        return await integration.getLapData(eventId, participantId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch lap data';
        setError(message);
        return [];
      }
    },
    [integration, isConnected]
  );

  /**
   * Subscribe to live updates
   */
  const subscribeToLiveUpdates = useCallback(
    (eventId: string, callback: (data: LiveEventData) => void): (() => void) => {
      if (!integration || !isConnected) {
        setError('Not connected to a timing platform');
        return () => {};
      }

      return integration.subscribeToLiveUpdates(eventId, callback);
    },
    [integration, isConnected]
  );

  return {
    selectedPlatform,
    integration,
    isConnected,
    isConnecting,
    error,
    credentials,
    connect,
    disconnect,
    getEvents,
    getEventDetails,
    getLapData,
    subscribeToLiveUpdates,
  };
}

/**
 * Hook for monitoring live lap times from current platform
 */
export function useLiveEventMonitoring(eventId: string | null) {
  const { integration, isConnected } = useTimingPlatform();
  const [eventData, setEventData] = useState<LiveEventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !integration || !isConnected) return;

    setLoading(true);
    setError(null);

    // Subscribe to live updates
    const unsubscribe = integration.subscribeToLiveUpdates(eventId, (data) => {
      setEventData(data);
      setLoading(false);
    });

    // Fetch initial data
    integration
      .getEventDetails(eventId)
      .then((data) => {
        if (data) {
          setEventData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load event');
        setLoading(false);
      });

    return unsubscribe;
  }, [eventId, integration, isConnected]);

  return { eventData, loading, error };
}

/**
 * Hook for tracking participant lap times
 */
export function useParticipantLapTracking(
  eventId: string | null,
  participantId: string | null
) {
  const { integration, isConnected } = useTimingPlatform();
  const [lapTimes, setLapTimes] = useState<LiveLapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !participantId || !integration || !isConnected) return;

    setLoading(true);
    setError(null);

    // Subscribe to live updates
    const unsubscribe = integration.subscribeToLiveUpdates(eventId, async (eventData) => {
      // Find participant in event data
      const participant = eventData.participants.find((p) => p.participantId === participantId);
      if (participant) {
        setLapTimes(participant.lapHistory);
      }
    });

    // Fetch initial lap data
    integration
      .getLapData(eventId, participantId)
      .then((data) => {
        setLapTimes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load lap times');
        setLoading(false);
      });

    return unsubscribe;
  }, [eventId, participantId, integration, isConnected]);

  return { lapTimes, loading, error };
}

/**
 * Hook for real-time setup performance analysis
 */
export function useSetupPerformanceTracking(
  eventId: string | null,
  participantId: string | null,
  setupId: string | null
) {
  const { lapTimes, loading, error } = useParticipantLapTracking(eventId, participantId);
  const [performance, setPerformance] = useState<{
    bestLap: number | null;
    averageLap: number | null;
    improvementTrend: number; // percentage improvement over time
    lapCount: number;
  } | null>(null);

  useEffect(() => {
    if (lapTimes.length === 0) return;

    const validLaps = lapTimes.filter((l) => l.isValid);
    if (validLaps.length === 0) return;

    const lapTimeValues = validLaps.map((l) => l.lapTime);
    const bestLap = Math.min(...lapTimeValues);
    const averageLap = lapTimeValues.reduce((a, b) => a + b, 0) / lapTimeValues.length;

    // Calculate improvement trend (first 3 laps vs last 3 laps)
    let improvementTrend = 0;
    if (lapTimeValues.length >= 6) {
      const firstThree = lapTimeValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const lastThree = lapTimeValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
      improvementTrend = ((firstThree - lastThree) / firstThree) * 100;
    }

    setPerformance({
      bestLap,
      averageLap,
      improvementTrend,
      lapCount: validLaps.length,
    });
  }, [lapTimes]);

  return { performance, loading, error };
}
