import { useState, useCallback, useEffect } from 'react';
import {
  fetchSpeedhiveEvents,
  fetchSpeedhiveEvent,
  fetchSpeedhiveLapTimes,
  fetchSpeedhiveParticipantLaps,
  getSpeedhiveBestLap,
  getSpeedhiveParticipantBestLap,
  fetchSpeedhiveParticipants,
  fetchSpeedhiveLocations,
  searchSpeedhiveLocations,
  searchSpeedhiveEvents,
  SpeedhiveClient,
} from '@/lib/services/speedhive';
import type {
  SpeedhiveEvent,
  SpeedhiveLocation,
  SpeedhiveLapTime,
  SpeedhiveParticipant,
} from '@/lib/services/speedhive';

// ============================================================================
// useSpeedhiveEvents Hook
// ============================================================================

interface UseSpeedhiveEventsOptions {
  locationId?: string;
  status?: 'scheduled' | 'active' | 'completed';
  autoFetch?: boolean;
}

export function useSpeedhiveEvents(options: UseSpeedhiveEventsOptions = {}) {
  const { autoFetch = true } = options;
  const [events, setEvents] = useState<SpeedhiveEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSpeedhiveEvents({
        locationId: options.locationId,
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
  }, [options.locationId, options.status]);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

// ============================================================================
// useSpeedhiveEvent Hook
// ============================================================================

export function useSpeedhiveEvent(eventId: string | null) {
  const [event, setEvent] = useState<SpeedhiveEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const data = await fetchSpeedhiveEvent(eventId);
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
// useSpeedhiveLapTimes Hook
// ============================================================================

export function useSpeedhiveLapTimes(eventId: string | null) {
  const [lapTimes, setLapTimes] = useState<SpeedhiveLapTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLapTimes = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const data = await fetchSpeedhiveLapTimes(eventId);
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
// useSpeedhiveParticipantLaps Hook
// ============================================================================

export function useSpeedhiveParticipantLaps(
  eventId: string | null,
  participantId: string | null
) {
  const [laps, setLaps] = useState<SpeedhiveLapTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLaps = useCallback(async () => {
    if (!eventId || !participantId) return;

    setLoading(true);
    try {
      const data = await fetchSpeedhiveParticipantLaps(eventId, participantId);
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
// useSpeedhiveBestLap Hook
// ============================================================================

export function useSpeedhiveBestLap(eventId: string | null) {
  const [bestLap, setBestLap] = useState<SpeedhiveLapTime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBestLap = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const data = await getSpeedhiveBestLap(eventId);
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
// useSpeedhiveParticipantBestLap Hook
// ============================================================================

export function useSpeedhiveParticipantBestLap(
  eventId: string | null,
  participantId: string | null
) {
  const [bestLap, setBestLap] = useState<SpeedhiveLapTime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBestLap = useCallback(async () => {
    if (!eventId || !participantId) return;

    setLoading(true);
    try {
      const data = await getSpeedhiveParticipantBestLap(eventId, participantId);
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
// useSpeedhiveParticipants Hook
// ============================================================================

export function useSpeedhiveParticipants(eventId: string | null) {
  const [participants, setParticipants] = useState<SpeedhiveParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const data = await fetchSpeedhiveParticipants(eventId);
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
// useSpeedhiveLocations Hook
// ============================================================================

interface UseSpeedhiveLocationsOptions {
  autoFetch?: boolean;
}

export function useSpeedhiveLocations(options: UseSpeedhiveLocationsOptions = {}) {
  const { autoFetch = true } = options;
  const [locations, setLocations] = useState<SpeedhiveLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSpeedhiveLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchLocations();
    }
  }, [autoFetch, fetchLocations]);

  return { locations, loading, error, refetch: fetchLocations };
}

// ============================================================================
// useSpeedhiveSearch Hook
// ============================================================================

interface UseSpeedhiveSearchOptions {
  type: 'events' | 'locations';
  debounceMs?: number;
}

export function useSpeedhiveSearch(options: UseSpeedhiveSearchOptions) {
  const { type, debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpeedhiveEvent[] | SpeedhiveLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        if (type === 'events') {
          const data = await searchSpeedhiveEvents(query);
          setResults(data);
        } else {
          const data = await searchSpeedhiveLocations(query);
          setResults(data);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, type, debounceMs]);

  return { query, setQuery, results, loading, error };
}

// ============================================================================
// useSpeedhiveStats Hook
// ============================================================================

interface SpeedhiveStats {
  bestLapTime: number;
  averageLapTime: number;
  totalLaps: number;
  validLaps: number;
  improvementRate: number; // percentage
}

export function useSpeedhiveStats(lapTimes: SpeedhiveLapTime[]): SpeedhiveStats {
  const [stats, setStats] = useState<SpeedhiveStats>({
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

    const validLaps = lapTimes.filter((lap) => lap.isValid);
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
 * Format lap time using SpeedhiveClient utility
 */
export function useFormatLapTime(ms: number): string {
  return SpeedhiveClient.formatLapTime(ms);
}

/**
 * Format gap time using SpeedhiveClient utility
 */
export function useFormatGapTime(ms: number): string {
  return SpeedhiveClient.formatGapTime(ms);
}
