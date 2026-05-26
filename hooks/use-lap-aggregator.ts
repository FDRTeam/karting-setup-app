import { useState, useCallback, useEffect } from 'react';
import {
  getLapAggregator,
  createNewAggregator,
  LapAggregator,
} from '@/lib/services/lap-aggregator';
import type {
  UnifiedLapTime,
  LapSession,
  LapAggregateStats,
  LapTrend,
  LapComparison,
} from '@/lib/services/lap-aggregator';
import type { SpeedhiveLapTime } from '@/lib/services/speedhive';
import type { AlphaRacehubLapTime } from '@/lib/services/alpha-racehub';
import type { RaceMonitorLapTime } from '@/lib/services/race-monitor';

// ============================================================================
// useLapAggregator Hook
// ============================================================================

export function useLapAggregator() {
  const [aggregator] = useState(() => getLapAggregator());
  const [lapTimes, setLapTimes] = useState<UnifiedLapTime[]>([]);
  const [sessions, setSessions] = useState<LapSession[]>([]);
  const [stats, setStats] = useState<LapAggregateStats | null>(null);

  const refresh = useCallback(() => {
    setLapTimes(aggregator.getAllLapTimes());
    setSessions(aggregator.getSessions());
    setStats(aggregator.calculateStats());
  }, [aggregator]);

  const addSpeedhiveLaps = useCallback(
    (
      eventId: string,
      eventName: string,
      eventDate: string,
      trackName: string,
      laps: SpeedhiveLapTime[]
    ) => {
      aggregator.addSpeedhiveLaps(eventId, eventName, eventDate, trackName, laps);
      refresh();
    },
    [aggregator, refresh]
  );

  const addAlphaRacehubLaps = useCallback(
    (
      eventId: string,
      eventName: string,
      eventDate: string,
      trackName: string,
      laps: AlphaRacehubLapTime[]
    ) => {
      aggregator.addAlphaRacehubLaps(eventId, eventName, eventDate, trackName, laps);
      refresh();
    },
    [aggregator, refresh]
  );

  const addRaceMonitorLaps = useCallback(
    (
      eventId: string,
      eventName: string,
      eventDate: string,
      trackName: string,
      laps: RaceMonitorLapTime[]
    ) => {
      aggregator.addRaceMonitorLaps(eventId, eventName, eventDate, trackName, laps);
      refresh();
    },
    [aggregator, refresh]
  );

  const addManualLaps = useCallback(
    (
      eventId: string,
      eventName: string,
      eventDate: string,
      trackName: string,
      laps: UnifiedLapTime[]
    ) => {
      aggregator.addManualLaps(eventId, eventName, eventDate, trackName, laps);
      refresh();
    },
    [aggregator, refresh]
  );

  const clear = useCallback(() => {
    aggregator.clear();
    refresh();
  }, [aggregator, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    aggregator,
    lapTimes,
    sessions,
    stats,
    addSpeedhiveLaps,
    addAlphaRacehubLaps,
    addRaceMonitorLaps,
    addManualLaps,
    refresh,
    clear,
  };
}

// ============================================================================
// useLapSorting Hook
// ============================================================================

type SortBy = 'speed' | 'date' | 'session';

export function useLapSorting(lapTimes: UnifiedLapTime[]) {
  const [sortBy, setSortBy] = useState<SortBy>('speed');
  const [sortedLaps, setSortedLaps] = useState<UnifiedLapTime[]>([]);

  useEffect(() => {
    let sorted = [...lapTimes];

    switch (sortBy) {
      case 'speed':
        sorted.sort((a, b) => a.lapTime - b.lapTime);
        break;
      case 'date':
        sorted.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        break;
      case 'session':
        sorted.sort((a, b) => {
          const sessionCompare = a.eventName.localeCompare(b.eventName);
          if (sessionCompare !== 0) return sessionCompare;
          return a.lapNumber - b.lapNumber;
        });
        break;
    }

    setSortedLaps(sorted);
  }, [lapTimes, sortBy]);

  return { sortedLaps, sortBy, setSortBy };
}

// ============================================================================
// useLapFiltering Hook
// ============================================================================

interface LapFilterOptions {
  source?: string;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  minLapTime?: number;
  maxLapTime?: number;
  onlyValid?: boolean;
}

export function useLapFiltering(
  lapTimes: UnifiedLapTime[],
  options: LapFilterOptions = {}
) {
  const [filteredLaps, setFilteredLaps] = useState<UnifiedLapTime[]>([]);

  useEffect(() => {
    let filtered = [...lapTimes];

    if (options.source) {
      filtered = filtered.filter((lap) => lap.source === options.source);
    }

    if (options.sessionId) {
      filtered = filtered.filter((lap) => lap.eventId === options.sessionId);
    }

    if (options.startDate) {
      filtered = filtered.filter(
        (lap) => new Date(lap.timestamp) >= options.startDate!
      );
    }

    if (options.endDate) {
      filtered = filtered.filter(
        (lap) => new Date(lap.timestamp) <= options.endDate!
      );
    }

    if (options.minLapTime) {
      filtered = filtered.filter((lap) => lap.lapTime >= options.minLapTime!);
    }

    if (options.maxLapTime) {
      filtered = filtered.filter((lap) => lap.lapTime <= options.maxLapTime!);
    }

    if (options.onlyValid) {
      filtered = filtered.filter((lap) => lap.isValid);
    }

    setFilteredLaps(filtered);
  }, [lapTimes, options]);

  return filteredLaps;
}

// ============================================================================
// useLapTrends Hook
// ============================================================================

export function useLapTrends(aggregator: LapAggregator) {
  const [trends, setTrends] = useState<LapTrend[]>([]);

  useEffect(() => {
    setTrends(aggregator.getTrends());
  }, [aggregator]);

  return trends;
}

// ============================================================================
// useLapComparison Hook
// ============================================================================

export function useLapComparison(lapA: UnifiedLapTime | null, lapB: UnifiedLapTime | null) {
  const [comparison, setComparison] = useState<LapComparison | null>(null);

  useEffect(() => {
    if (!lapA || !lapB) {
      setComparison(null);
      return;
    }

    const aggregator = getLapAggregator();
    setComparison(aggregator.compareLaps(lapA, lapB));
  }, [lapA, lapB]);

  return comparison;
}

// ============================================================================
// useLapExport Hook
// ============================================================================

export function useLapExport(aggregator: LapAggregator) {
  const exportJSON = useCallback(() => {
    return aggregator.exportAsJSON();
  }, [aggregator]);

  const exportCSV = useCallback(() => {
    return aggregator.exportAsCSV();
  }, [aggregator]);

  return { exportJSON, exportCSV };
}

// ============================================================================
// useLapStatistics Hook
// ============================================================================

interface LapStatistics {
  totalLaps: number;
  validLaps: number;
  bestLap: number;
  averageLap: number;
  worstLap: number;
  improvementRate: number;
  consistencyScore: number;
}

export function useLapStatistics(lapTimes: UnifiedLapTime[]): LapStatistics {
  const [stats, setStats] = useState<LapStatistics>({
    totalLaps: 0,
    validLaps: 0,
    bestLap: 0,
    averageLap: 0,
    worstLap: 0,
    improvementRate: 0,
    consistencyScore: 0,
  });

  useEffect(() => {
    const validLaps = lapTimes.filter((lap) => lap.isValid);

    if (validLaps.length === 0) {
      setStats({
        totalLaps: 0,
        validLaps: 0,
        bestLap: 0,
        averageLap: 0,
        worstLap: 0,
        improvementRate: 0,
        consistencyScore: 0,
      });
      return;
    }

    const bestLap = Math.min(...validLaps.map((lap) => lap.lapTime));
    const averageLap =
      validLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / validLaps.length;
    const worstLap = Math.max(...validLaps.map((lap) => lap.lapTime));

    // Calculate improvement rate (first to last)
    let improvementRate = 0;
    if (validLaps.length > 1) {
      const firstLap = validLaps[0].lapTime;
      const lastLap = validLaps[validLaps.length - 1].lapTime;
      improvementRate = ((firstLap - lastLap) / firstLap) * 100;
    }

    // Calculate consistency (standard deviation)
    const mean = averageLap;
    const squareDiffs = validLaps.map((lap) =>
      Math.pow(lap.lapTime - mean, 2)
    );
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / validLaps.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    const consistencyScore = Math.max(0, Math.min(100, 100 - stdDev / 100));

    setStats({
      totalLaps: lapTimes.length,
      validLaps: validLaps.length,
      bestLap,
      averageLap,
      worstLap,
      improvementRate,
      consistencyScore,
    });
  }, [lapTimes]);

  return stats;
}

// ============================================================================
// useLapSessionComparison Hook
// ============================================================================

export function useLapSessionComparison(
  sessions: LapSession[]
): Map<string, { bestLap: number; averageLap: number; count: number }> {
  const [comparison, setComparison] = useState<
    Map<string, { bestLap: number; averageLap: number; count: number }>
  >(new Map());

  useEffect(() => {
    const map = new Map<string, { bestLap: number; averageLap: number; count: number }>();

    sessions.forEach((session) => {
      const validLaps = session.lapTimes.filter((lap) => lap.isValid);
      if (validLaps.length === 0) return;

      const bestLap = Math.min(...validLaps.map((lap) => lap.lapTime));
      const averageLap =
        validLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / validLaps.length;

      map.set(session.id, {
        bestLap,
        averageLap,
        count: validLaps.length,
      });
    });

    setComparison(map);
  }, [sessions]);

  return comparison;
}

// ============================================================================
// Utility Hooks
// ============================================================================

export function useFormatLapTime(ms: number): string {
  return formatLapTime(ms);
}

export function useFormatGapTime(ms: number): string {
  return formatGapTime(ms);
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function formatGapTime(ms: number): string {
  const sign = ms < 0 ? '-' : '+';
  const absMs = Math.abs(ms);
  const seconds = Math.floor(absMs / 1000);
  const milliseconds = absMs % 1000;
  return `${sign}${seconds}.${String(milliseconds).padStart(3, '0')}`;
}
