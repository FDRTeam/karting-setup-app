import { useState, useCallback, useEffect } from 'react';
import {
  fetchRaceMonitorEvents,
  fetchRaceMonitorEvent,
  fetchRaceMonitorLapTimes,
  fetchRaceMonitorParticipantLaps,
  getRaceMonitorBestLap,
  getRaceMonitorParticipantBestLap,
  fetchRaceMonitorParticipants,
  fetchRaceMonitorLeaderboard,
  fetchRaceMonitorSeries,
  searchRaceMonitorEvents,
  RaceMonitorClient,
  isRaceMonitorInitialized,
} from '@/lib/services/race-monitor';
import type {
  RaceMonitorEvent,
  RaceMonitorSeries,
  RaceMonitorLapTime,
  RaceMonitorParticipant,
} from '@/lib/services/race-monitor';

// ============================================================================
// useRaceMonitorEvents Hook
// ============================================================================

interface UseRaceMonitorEventsOptions {
  seriesId?: string;
  status?: 'scheduled' | 'active' | 'completed';
  autoFetch?: boolean;
}

export function useRaceMonitorEvents(options: UseRaceMonitorEventsOptions = {}) {
  const { autoFetch = true } = options;
  const [events, setEvents] = useState<RaceMonitorEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!isRaceMonitorInitialized()) {
      setError('Race Monitor not initialized');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchRaceMonitorEvents({
        seriesId: options.seriesId,
        status: options.status,
      });
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [options.seriesId, options.status]);

  useEffect(() => {
    if (autoFetch && isRaceMonitorInitialized()) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

// ============================================================================
// useRaceMonitorEvent Hook
// ============================================================================

export function useRaceMonitorEvent(eventId: string | null) {
  const [event, setEvent] = useState<RaceMonitorEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await fetchRaceMonitorEvent(eventId);
      setEvent(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
}

// ============================================================================
// useRaceMonitorLapTimes Hook
// ============================================================================

export function useRaceMonitorLapTimes(eventId: string | null) {
  const [lapTimes, setLapTimes] = useState<RaceMonitorLapTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLapTimes = useCallback(async () => {
    if (!eventId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await fetchRaceMonitorLapTimes(eventId);
      setLapTimes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lap times');
      setLapTimes([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLapTimes();
  }, [fetchLapTimes]);

  return { lapTimes, loading, error, refetch: fetchLapTimes };
}

// ============================================================================
// useRaceMonitorParticipantLaps Hook
// ============================================================================

export function useRaceMonitorParticipantLaps(
  eventId: string | null,
  participantId: string | null
) {
  const [laps, setLaps] = useState<RaceMonitorLapTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLaps = useCallback(async () => {
    if (!eventId || !participantId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await fetchRaceMonitorParticipantLaps(eventId, participantId);
      setLaps(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participant laps');
      setLaps([]);
    } finally {
      setLoading(false);
    }
  }, [eventId, participantId]);

  useEffect(() => {
    fetchLaps();
  }, [fetchLaps]);

  return { laps, loading, error, refetch: fetchLaps };
}

// ============================================================================
// useRaceMonitorBestLap Hook
// ============================================================================

export function useRaceMonitorBestLap(eventId: string | null) {
  const [bestLap, setBestLap] = useState<RaceMonitorLapTime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBestLap = useCallback(async () => {
    if (!eventId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await getRaceMonitorBestLap(eventId);
      setBestLap(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch best lap');
      setBestLap(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBestLap();
  }, [fetchBestLap]);

  return { bestLap, loading, error, refetch: fetchBestLap };
}

// ============================================================================
// useRaceMonitorParticipantBestLap Hook
// ============================================================================

export function useRaceMonitorParticipantBestLap(
  eventId: string | null,
  participantId: string | null
) {
  const [bestLap, setBestLap] = useState<RaceMonitorLapTime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBestLap = useCallback(async () => {
    if (!eventId || !participantId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await getRaceMonitorParticipantBestLap(eventId, participantId);
      setBestLap(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch best lap');
      setBestLap(null);
    } finally {
      setLoading(false);
    }
  }, [eventId, participantId]);

  useEffect(() => {
    fetchBestLap();
  }, [fetchBestLap]);

  return { bestLap, loading, error, refetch: fetchBestLap };
}

// ============================================================================
// useRaceMonitorParticipants Hook
// ============================================================================

export function useRaceMonitorParticipants(eventId: string | null) {
  const [participants, setParticipants] = useState<RaceMonitorParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (!eventId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await fetchRaceMonitorParticipants(eventId);
      setParticipants(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participants');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return { participants, loading, error, refetch: fetchParticipants };
}

// ============================================================================
// useRaceMonitorLeaderboard Hook
// ============================================================================

export function useRaceMonitorLeaderboard(eventId: string | null) {
  const [leaderboard, setLeaderboard] = useState<RaceMonitorParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    if (!eventId || !isRaceMonitorInitialized()) return;

    setLoading(true);
    try {
      const data = await fetchRaceMonitorLeaderboard(eventId);
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
}

// ============================================================================
// useRaceMonitorSeries Hook
// ============================================================================

interface UseRaceMonitorSeriesOptions {
  autoFetch?: boolean;
}

export function useRaceMonitorSeries(options: UseRaceMonitorSeriesOptions = {}) {
  const { autoFetch = true } = options;
  const [series, setSeries] = useState<RaceMonitorSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = useCallback(async () => {
    if (!isRaceMonitorInitialized()) {
      setError('Race Monitor not initialized');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchRaceMonitorSeries();
      setSeries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch series');
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch && isRaceMonitorInitialized()) {
      fetchSeries();
    }
  }, [autoFetch, fetchSeries]);

  return { series, loading, error, refetch: fetchSeries };
}

// ============================================================================
// useRaceMonitorSearch Hook
// ============================================================================

interface UseRaceMonitorSearchOptions {
  debounceMs?: number;
}

export function useRaceMonitorSearch(options: UseRaceMonitorSearchOptions = {}) {
  const { debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RaceMonitorEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim() || !isRaceMonitorInitialized()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchRaceMonitorEvents(query);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { query, setQuery, results, loading, error };
}

// ============================================================================
// useRaceMonitorStats Hook
// ============================================================================

interface RaceMonitorStats {
  bestLapTime: number;
  averageLapTime: number;
  totalLaps: number;
  validLaps: number;
  improvementRate: number; // percentage
}

export function useRaceMonitorStats(lapTimes: RaceMonitorLapTime[]): RaceMonitorStats {
  const [stats, setStats] = useState<RaceMonitorStats>({
    bestLapTime: 0,
    averageLapTime: 0,
    totalLaps: 0,
    validLaps: 0,
    improvementRate: 0,
  });

  useEffect(() => {
    if (lapTimes.length === 0) {
      setStats({
        bestLapTime: 0,
        averageLapTime: 0,
        totalLaps: 0,
        validLaps: 0,
        improvementRate: 0,
      });
      return;
    }

    const validLaps = lapTimes.filter((lap) => RaceMonitorClient.isValidLap(lap));
    const bestLapTime = validLaps.length > 0
      ? Math.min(...validLaps.map((lap) => lap.lapTime))
      : 0;

    const totalTime = validLaps.reduce((sum, lap) => sum + lap.lapTime, 0);
    const averageLapTime = validLaps.length > 0 ? totalTime / validLaps.length : 0;

    // Calculate improvement rate (first lap vs last lap)
    let improvementRate = 0;
    if (validLaps.length > 1) {
      const firstLap = validLaps[0].lapTime;
      const lastLap = validLaps[validLaps.length - 1].lapTime;
      improvementRate = ((firstLap - lastLap) / firstLap) * 100;
    }

    setStats({
      bestLapTime,
      averageLapTime,
      totalLaps: lapTimes.length,
      validLaps: validLaps.length,
      improvementRate,
    });
  }, [lapTimes]);

  return stats;
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Format lap time using RaceMonitorClient utility
 */
export function useFormatLapTime(ms: number): string {
  return RaceMonitorClient.formatLapTime(ms);
}

/**
 * Format gap time using RaceMonitorClient utility
 */
export function useFormatGapTime(ms: number): string {
  return RaceMonitorClient.formatGapTime(ms);
}
