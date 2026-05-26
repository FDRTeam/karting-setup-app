import { useState, useCallback, useEffect, useRef } from 'react';
import { useSpeedhiveLapTimes } from './use-speedhive';
import { useRaceMonitorLapTimes } from './use-race-monitor';
import { saveLiveLapTimes, getLiveLapTimes } from '@/lib/services/lap-storage';
import type { UnifiedLapTime } from '@/lib/services/lap-aggregator';

interface LiveLapTimesState {
  eventId: string;
  source: 'speedhive' | 'race_monitor' | 'manual';
  lapTimes: UnifiedLapTime[];
  lastUpdated: string;
  isLive: boolean;
  lapCount: number;
  bestLap: number | null;
  latestLap: UnifiedLapTime | null;
}

interface UseLiveLapTimesOptions {
  eventId: string | null;
  source: 'speedhive' | 'race_monitor' | 'manual';
  autoRefreshInterval?: number; // milliseconds, default 5000 (5 seconds)
  autoRefresh?: boolean;
  persistToStorage?: boolean;
}

/**
 * Hook for tracking live lap times from events
 * Automatically refreshes from API and persists to local storage
 */
export function useLiveLapTimes(options: UseLiveLapTimesOptions) {
  const {
    eventId,
    source,
    autoRefreshInterval = 5000,
    autoRefresh = true,
    persistToStorage = true,
  } = options;

  const [state, setState] = useState<LiveLapTimesState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch from appropriate source
  const { lapTimes: speedhiveLaps } = useSpeedhiveLapTimes(
    source === 'speedhive' ? eventId : null
  );
  const { lapTimes: raceMonitorLaps } = useRaceMonitorLapTimes(
    source === 'race_monitor' ? eventId : null
  );

  const updateState = useCallback(
    async (newLapTimes: UnifiedLapTime[]) => {
      if (!eventId) return;

      const validLaps = newLapTimes.filter((lap) => lap.isValid);
      const bestLap = validLaps.length > 0
        ? Math.min(...validLaps.map((lap) => lap.lapTime))
        : null;

      const latestLap = newLapTimes.length > 0
        ? newLapTimes[newLapTimes.length - 1]
        : null;

      const newState: LiveLapTimesState = {
        eventId,
        source,
        lapTimes: newLapTimes,
        lastUpdated: new Date().toISOString(),
        isLive: true,
        lapCount: newLapTimes.length,
        bestLap,
        latestLap,
      };

      setState(newState);

      // Persist to storage
      if (persistToStorage) {
        try {
          await saveLiveLapTimes(eventId, newLapTimes);
        } catch (err) {
          console.error('Failed to persist live lap times:', err);
        }
      }
    },
    [eventId, source, persistToStorage]
  );

  // Update when API data changes
  useEffect(() => {
    if (source === 'speedhive' && speedhiveLaps.length > 0) {
      const unified = speedhiveLaps.map((lap) => ({
        id: lap.id,
        source: 'speedhive' as const,
        eventId: eventId || '',
        eventName: '',
        eventDate: new Date().toISOString(),
        trackName: '',
        lapNumber: lap.lapNumber,
        lapTime: lap.lapTime,
        position: lap.position,
        gap: lap.gap,
        isValid: lap.isValid,
        timestamp: lap.timestamp,
      }));
      updateState(unified);
    }
  }, [speedhiveLaps, source, eventId, updateState]);

  useEffect(() => {
    if (source === 'race_monitor' && raceMonitorLaps.length > 0) {
      const unified = raceMonitorLaps.map((lap) => ({
        id: lap.id,
        source: 'race_monitor' as const,
        eventId: eventId || '',
        eventName: '',
        eventDate: new Date().toISOString(),
        trackName: '',
        lapNumber: lap.lapNumber,
        lapTime: lap.lapTime,
        position: lap.position,
        gap: lap.gap,
        isValid: lap.isValid && !lap.isPenalty,
        timestamp: lap.timestamp,
      }));
      updateState(unified);
    }
  }, [raceMonitorLaps, source, eventId, updateState]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !eventId) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    refreshIntervalRef.current = setInterval(() => {
      // Refresh will happen automatically through hook dependencies
    }, autoRefreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, autoRefreshInterval, eventId]);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      if (!eventId || !persistToStorage) return;

      try {
        const persisted = await getLiveLapTimes(eventId);
        if (persisted && persisted.length > 0) {
          await updateState(persisted);
        }
      } catch (err) {
        console.error('Failed to load persisted lap times:', err);
      }
    };

    loadPersistedData();
  }, [eventId, persistToStorage, updateState]);

  const stopLiveTracking = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (state) {
      setState({ ...state, isLive: false });
    }
  }, [state]);

  const resumeLiveTracking = useCallback(() => {
    if (state) {
      setState({ ...state, isLive: true });
    }
  }, [state]);

  return {
    ...state,
    loading,
    error,
    stopLiveTracking,
    resumeLiveTracking,
  };
}

/**
 * Hook for tracking multiple live events simultaneously
 */
export function useMultipleLiveLapTimes(
  events: Array<{ eventId: string; source: 'speedhive' | 'race_monitor' }>
) {
  const [allLapTimes, setAllLapTimes] = useState<Map<string, UnifiedLapTime[]>>(
    new Map()
  );

  const { lapTimes: speedhiveLaps } = useSpeedhiveLapTimes(
    events.find((e) => e.source === 'speedhive')?.eventId || null
  );
  const { lapTimes: raceMonitorLaps } = useRaceMonitorLapTimes(
    events.find((e) => e.source === 'race_monitor')?.eventId || null
  );

  useEffect(() => {
    const updated = new Map(allLapTimes);

    events.forEach((event) => {
      if (event.source === 'speedhive' && speedhiveLaps.length > 0) {
        const unified = speedhiveLaps.map((lap) => ({
          id: lap.id,
          source: 'speedhive' as const,
          eventId: event.eventId,
          eventName: '',
          eventDate: new Date().toISOString(),
          trackName: '',
          lapNumber: lap.lapNumber,
          lapTime: lap.lapTime,
          position: lap.position,
          gap: lap.gap,
          isValid: lap.isValid,
          timestamp: lap.timestamp,
        }));
        updated.set(event.eventId, unified);
      }

      if (event.source === 'race_monitor' && raceMonitorLaps.length > 0) {
        const unified = raceMonitorLaps.map((lap) => ({
          id: lap.id,
          source: 'race_monitor' as const,
          eventId: event.eventId,
          eventName: '',
          eventDate: new Date().toISOString(),
          trackName: '',
          lapNumber: lap.lapNumber,
          lapTime: lap.lapTime,
          position: lap.position,
          gap: lap.gap,
          isValid: lap.isValid && !lap.isPenalty,
          timestamp: lap.timestamp,
        }));
        updated.set(event.eventId, unified);
      }
    });

    setAllLapTimes(updated);
  }, [speedhiveLaps, raceMonitorLaps, events]);

  return allLapTimes;
}

/**
 * Hook for live lap time statistics
 */
export function useLiveLapStats(lapTimes: UnifiedLapTime[] | null) {
  const [stats, setStats] = useState({
    totalLaps: 0,
    validLaps: 0,
    bestLap: 0,
    averageLap: 0,
    lastLapTime: 0,
    improvementFromFirst: 0,
  });

  useEffect(() => {
    if (!lapTimes || lapTimes.length === 0) {
      setStats({
        totalLaps: 0,
        validLaps: 0,
        bestLap: 0,
        averageLap: 0,
        lastLapTime: 0,
        improvementFromFirst: 0,
      });
      return;
    }

    const validLaps = lapTimes.filter((lap) => lap.isValid);
    const bestLap = validLaps.length > 0
      ? Math.min(...validLaps.map((lap) => lap.lapTime))
      : 0;

    const averageLap = validLaps.length > 0
      ? validLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / validLaps.length
      : 0;

    const lastLapTime = lapTimes[lapTimes.length - 1]?.lapTime || 0;

    let improvementFromFirst = 0;
    if (validLaps.length > 1) {
      const firstLap = validLaps[0].lapTime;
      const lastLap = validLaps[validLaps.length - 1].lapTime;
      improvementFromFirst = ((firstLap - lastLap) / firstLap) * 100;
    }

    setStats({
      totalLaps: lapTimes.length,
      validLaps: validLaps.length,
      bestLap,
      averageLap,
      lastLapTime,
      improvementFromFirst,
    });
  }, [lapTimes]);

  return stats;
}
