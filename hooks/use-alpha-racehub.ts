import { useState, useCallback } from 'react';
import {
  AlphaRacehubCSVImporter,
  AlphaRacehubEventCreator,
  AlphaRacehubExporter,
  calculateLapStatistics,
  calculateDeltaToBest,
  formatGapTime,
} from '@/lib/services/alpha-racehub';
import type {
  AlphaRacehubEvent,
  AlphaRacehubLapTime,
  CSVParseResult,
} from '@/lib/services/alpha-racehub';

// ============================================================================
// useAlphaRacehubCSVImport Hook
// ============================================================================

interface UseAlphaRacehubCSVImportOptions {
  eventId: string;
  participantId: string;
  participantName: string;
}

export function useAlphaRacehubCSVImport(options: UseAlphaRacehubCSVImportOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CSVParseResult | null>(null);

  const importCSV = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parseResult = await AlphaRacehubCSVImporter.importFromCSV(
        options.eventId,
        options.participantId,
        options.participantName
      );

      setResult(parseResult);

      if (!parseResult.success) {
        setError(
          parseResult.errors.length > 0
            ? parseResult.errors[0]
            : 'Failed to import CSV'
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to import CSV';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.eventId, options.participantId, options.participantName]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { importCSV, loading, error, result, reset };
}

// ============================================================================
// useAlphaRacehubManualEvent Hook
// ============================================================================

export function useAlphaRacehubManualEvent() {
  const [event, setEvent] = useState<AlphaRacehubEvent | null>(null);

  const createEvent = useCallback(
    (name: string, date: string, location: string, trackLayout?: string) => {
      const newEvent = AlphaRacehubEventCreator.createManualEvent(
        name,
        date,
        location,
        trackLayout
      );
      setEvent(newEvent);
      return newEvent;
    },
    []
  );

  const reset = useCallback(() => {
    setEvent(null);
  }, []);

  return { event, createEvent, reset };
}

// ============================================================================
// useAlphaRacehubLapTimes Hook
// ============================================================================

export function useAlphaRacehubLapTimes() {
  const [lapTimes, setLapTimes] = useState<AlphaRacehubLapTime[]>([]);

  const addLapTime = useCallback(
    (lapTime: AlphaRacehubLapTime) => {
      setLapTimes((prev) => [...prev, lapTime]);
    },
    []
  );

  const addMultipleLapTimes = useCallback(
    (newLapTimes: AlphaRacehubLapTime[]) => {
      setLapTimes((prev) => [...prev, ...newLapTimes]);
    },
    []
  );

  const removeLapTime = useCallback((lapId: string) => {
    setLapTimes((prev) => prev.filter((lap) => lap.id !== lapId));
  }, []);

  const updateLapTime = useCallback(
    (lapId: string, updates: Partial<AlphaRacehubLapTime>) => {
      setLapTimes((prev) =>
        prev.map((lap) =>
          lap.id === lapId ? { ...lap, ...updates } : lap
        )
      );
    },
    []
  );

  const clearLapTimes = useCallback(() => {
    setLapTimes([]);
  }, []);

  return {
    lapTimes,
    addLapTime,
    addMultipleLapTimes,
    removeLapTime,
    updateLapTime,
    clearLapTimes,
  };
}

// ============================================================================
// useAlphaRacehubStats Hook
// ============================================================================

interface AlphaRacehubStats {
  bestLapTime: number;
  averageLapTime: number;
  totalLaps: number;
  validLaps: number;
  improvementRate: number;
}

export function useAlphaRacehubStats(lapTimes: AlphaRacehubLapTime[]): AlphaRacehubStats {
  return calculateLapStatistics(lapTimes);
}

// ============================================================================
// useAlphaRacehubExport Hook
// ============================================================================

export function useAlphaRacehubExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAsCSV = useCallback(
    async (event: AlphaRacehubEvent, lapTimes: AlphaRacehubLapTime[]) => {
      setExporting(true);
      setError(null);
      try {
        await AlphaRacehubExporter.shareAsCSV(event, lapTimes);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to export CSV';
        setError(errorMessage);
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const exportAsJSON = useCallback(
    async (event: AlphaRacehubEvent, lapTimes: AlphaRacehubLapTime[]) => {
      setExporting(true);
      setError(null);
      try {
        await AlphaRacehubExporter.shareAsJSON(event, lapTimes);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to export JSON';
        setError(errorMessage);
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const generateCSV = useCallback(
    (event: AlphaRacehubEvent, lapTimes: AlphaRacehubLapTime[]): string => {
      return AlphaRacehubExporter.generateCSV(event, lapTimes);
    },
    []
  );

  const generateJSON = useCallback(
    (event: AlphaRacehubEvent, lapTimes: AlphaRacehubLapTime[]): string => {
      return AlphaRacehubExporter.generateJSON(event, lapTimes);
    },
    []
  );

  return {
    exporting,
    error,
    exportAsCSV,
    exportAsJSON,
    generateCSV,
    generateJSON,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Format lap time using Alpha Racehub utilities
 */
export function useFormatLapTime(ms: number): string {
  return AlphaRacehubCSVImporter.formatLapTime(ms);
}

/**
 * Calculate delta to best lap
 */
export function useDeltaToBest(lapTime: number, bestLapTime: number): number {
  return calculateDeltaToBest(lapTime, bestLapTime);
}

/**
 * Format gap time
 */
export function useFormatGapTime(ms: number): string {
  return formatGapTime(ms);
}

/**
 * Parse lap time string to milliseconds
 */
export function useParseLapTime(timeStr: string): number | null {
  try {
    return AlphaRacehubCSVImporter.parseLapTimeString(timeStr);
  } catch {
    return null;
  }
}
