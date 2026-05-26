/**
 * Lap Aggregator Service
 * 
 * Combines lap times from multiple sources (Speedhive, Alpha Racehub, Race Monitor)
 * into a unified view with analytics, trends, and comparisons.
 */

import type { SpeedhiveLapTime } from './speedhive';
import type { AlphaRacehubLapTime } from './alpha-racehub';
import type { RaceMonitorLapTime } from './race-monitor';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type LapTimeSource = 'speedhive' | 'alpha_racehub' | 'race_monitor' | 'manual';

export interface UnifiedLapTime {
  id: string;
  source: LapTimeSource;
  eventId: string;
  eventName: string;
  eventDate: string;
  trackName: string;
  lapNumber: number;
  lapTime: number; // milliseconds
  position?: number;
  gap?: number;
  isValid: boolean;
  timestamp: string;
  notes?: string;
  // Computed fields
  deltaToSessionBest?: number;
  deltaToOverallBest?: number;
  improvementFromPrevious?: number;
}

export interface LapSession {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  trackName: string;
  source: LapTimeSource;
  lapTimes: UnifiedLapTime[];
}

export interface LapAggregateStats {
  totalLaps: number;
  validLaps: number;
  totalSessions: number;
  sources: LapTimeSource[];
  
  // Overall stats
  overallBestLap: UnifiedLapTime | null;
  overallAverageLap: number;
  overallWorstLap: number;
  
  // Per-source stats
  bySource: Map<LapTimeSource, {
    count: number;
    bestLap: number;
    averageLap: number;
    worstLap: number;
  }>;
  
  // Per-session stats
  bySessions: Map<string, {
    sessionName: string;
    count: number;
    bestLap: number;
    averageLap: number;
    worstLap: number;
    improvement: number; // percentage
  }>;
  
  // Trend analysis
  trend: {
    direction: 'improving' | 'declining' | 'stable';
    improvementRate: number; // percentage per session
    consistencyScore: number; // 0-100, higher is more consistent
  };
}

export interface LapComparison {
  lapA: UnifiedLapTime;
  lapB: UnifiedLapTime;
  timeDifference: number; // milliseconds
  percentDifference: number; // percentage
  faster: 'lapA' | 'lapB' | 'tied';
  deltaPerLap: number; // average difference per lap
}

export interface LapTrend {
  sessionIndex: number;
  sessionName: string;
  bestLap: number;
  averageLap: number;
  improvement: number; // percentage from previous session
  consistency: number; // standard deviation of lap times
}

// ============================================================================
// Lap Aggregator Service
// ============================================================================

export class LapAggregator {
  private sessions: Map<string, LapSession> = new Map();
  private allLapTimes: UnifiedLapTime[] = [];

  /**
   * Add Speedhive lap times to aggregation
   */
  addSpeedhiveLaps(
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string,
    lapTimes: SpeedhiveLapTime[]
  ): void {
    const sessionId = `speedhive-${eventId}`;
    const unifiedLaps = lapTimes.map((lap) => this.unifySpeedhiveLap(lap, eventId, eventName, eventDate, trackName));
    
    this.sessions.set(sessionId, {
      id: sessionId,
      eventId,
      eventName,
      eventDate,
      trackName,
      source: 'speedhive',
      lapTimes: unifiedLaps,
    });

    this.allLapTimes.push(...unifiedLaps);
    this.computeDeltas();
  }

  /**
   * Add Alpha Racehub lap times to aggregation
   */
  addAlphaRacehubLaps(
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string,
    lapTimes: AlphaRacehubLapTime[]
  ): void {
    const sessionId = `alpha-${eventId}`;
    const unifiedLaps = lapTimes.map((lap) => this.unifyAlphaRacehubLap(lap, eventId, eventName, eventDate, trackName));
    
    this.sessions.set(sessionId, {
      id: sessionId,
      eventId,
      eventName,
      eventDate,
      trackName,
      source: 'alpha_racehub',
      lapTimes: unifiedLaps,
    });

    this.allLapTimes.push(...unifiedLaps);
    this.computeDeltas();
  }

  /**
   * Add Race Monitor lap times to aggregation
   */
  addRaceMonitorLaps(
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string,
    lapTimes: RaceMonitorLapTime[]
  ): void {
    const sessionId = `race-monitor-${eventId}`;
    const unifiedLaps = lapTimes.map((lap) => this.unifyRaceMonitorLap(lap, eventId, eventName, eventDate, trackName));
    
    this.sessions.set(sessionId, {
      id: sessionId,
      eventId,
      eventName,
      eventDate,
      trackName,
      source: 'race_monitor',
      lapTimes: unifiedLaps,
    });

    this.allLapTimes.push(...unifiedLaps);
    this.computeDeltas();
  }

  /**
   * Add manual lap times to aggregation
   */
  addManualLaps(
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string,
    lapTimes: UnifiedLapTime[]
  ): void {
    const sessionId = `manual-${eventId}`;
    
    this.sessions.set(sessionId, {
      id: sessionId,
      eventId,
      eventName,
      eventDate,
      trackName,
      source: 'manual',
      lapTimes,
    });

    this.allLapTimes.push(...lapTimes);
    this.computeDeltas();
  }

  /**
   * Get all aggregated lap times
   */
  getAllLapTimes(): UnifiedLapTime[] {
    return [...this.allLapTimes];
  }

  /**
   * Get lap times for a specific session
   */
  getSessionLapTimes(sessionId: string): UnifiedLapTime[] {
    return this.sessions.get(sessionId)?.lapTimes || [];
  }

  /**
   * Get all sessions
   */
  getSessions(): LapSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get sessions sorted by date
   */
  getSessionsSortedByDate(): LapSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }

  /**
   * Calculate comprehensive statistics
   */
  calculateStats(): LapAggregateStats {
    const validLaps = this.allLapTimes.filter((lap) => lap.isValid);
    const overallBestLap = validLaps.length > 0
      ? validLaps.reduce((best, current) =>
          current.lapTime < best.lapTime ? current : best
        )
      : null;

    const overallAverageLap = validLaps.length > 0
      ? validLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / validLaps.length
      : 0;

    const overallWorstLap = validLaps.length > 0
      ? Math.max(...validLaps.map((lap) => lap.lapTime))
      : 0;

    // Stats by source
    const bySource = new Map<LapTimeSource, any>();
    const sources = new Set<LapTimeSource>();

    validLaps.forEach((lap) => {
      sources.add(lap.source);
      if (!bySource.has(lap.source)) {
        bySource.set(lap.source, {
          count: 0,
          bestLap: Infinity,
          averageLap: 0,
          worstLap: 0,
          totalTime: 0,
        });
      }

      const stats = bySource.get(lap.source)!;
      stats.count++;
      stats.totalTime += lap.lapTime;
      stats.bestLap = Math.min(stats.bestLap, lap.lapTime);
      stats.worstLap = Math.max(stats.worstLap, lap.lapTime);
    });

    // Finalize source stats
    bySource.forEach((stats) => {
      stats.averageLap = stats.totalTime / stats.count;
      delete stats.totalTime;
    });

    // Stats by session
    const bySessions = new Map<string, any>();
    const sessionsSorted = this.getSessionsSortedByDate();

    sessionsSorted.forEach((session, index) => {
      const sessionValidLaps = session.lapTimes.filter((lap) => lap.isValid);
      if (sessionValidLaps.length === 0) return;

      const bestLap = Math.min(...sessionValidLaps.map((lap) => lap.lapTime));
      const averageLap =
        sessionValidLaps.reduce((sum, lap) => sum + lap.lapTime, 0) /
        sessionValidLaps.length;

      let improvement = 0;
      if (index > 0) {
        const prevSession = sessionsSorted[index - 1];
        const prevValidLaps = prevSession.lapTimes.filter((lap) => lap.isValid);
        if (prevValidLaps.length > 0) {
          const prevBestLap = Math.min(...prevValidLaps.map((lap) => lap.lapTime));
          improvement = ((prevBestLap - bestLap) / prevBestLap) * 100;
        }
      }

      bySessions.set(session.id, {
        sessionName: session.eventName,
        count: sessionValidLaps.length,
        bestLap,
        averageLap,
        improvement,
      });
    });

    // Calculate trend
    const trend = this.calculateTrend();

    return {
      totalLaps: this.allLapTimes.length,
      validLaps: validLaps.length,
      totalSessions: this.sessions.size,
      sources: Array.from(sources),
      overallBestLap,
      overallAverageLap,
      overallWorstLap,
      bySource,
      bySessions,
      trend,
    };
  }

  /**
   * Get lap times sorted by speed (fastest first)
   */
  getLapTimesSortedBySpeed(): UnifiedLapTime[] {
    return [...this.allLapTimes]
      .filter((lap) => lap.isValid)
      .sort((a, b) => a.lapTime - b.lapTime);
  }

  /**
   * Get lap times sorted by date (newest first)
   */
  getLapTimesSortedByDate(): UnifiedLapTime[] {
    return [...this.allLapTimes].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Filter lap times by source
   */
  filterBySource(source: LapTimeSource): UnifiedLapTime[] {
    return this.allLapTimes.filter((lap) => lap.source === source);
  }

  /**
   * Filter lap times by session
   */
  filterBySession(sessionId: string): UnifiedLapTime[] {
    return this.sessions.get(sessionId)?.lapTimes || [];
  }

  /**
   * Filter lap times by date range
   */
  filterByDateRange(startDate: Date, endDate: Date): UnifiedLapTime[] {
    return this.allLapTimes.filter((lap) => {
      const lapDate = new Date(lap.timestamp);
      return lapDate >= startDate && lapDate <= endDate;
    });
  }

  /**
   * Compare two lap times
   */
  compareLaps(lapA: UnifiedLapTime, lapB: UnifiedLapTime): LapComparison {
    const timeDifference = Math.abs(lapA.lapTime - lapB.lapTime);
    const percentDifference = (timeDifference / Math.min(lapA.lapTime, lapB.lapTime)) * 100;

    return {
      lapA,
      lapB,
      timeDifference,
      percentDifference,
      faster: lapA.lapTime < lapB.lapTime ? 'lapA' : lapB.lapTime < lapA.lapTime ? 'lapB' : 'tied',
      deltaPerLap: timeDifference,
    };
  }

  /**
   * Get performance trends across sessions
   */
  getTrends(): LapTrend[] {
    const sessionsSorted = this.getSessionsSortedByDate();
    const trends: LapTrend[] = [];

    sessionsSorted.forEach((session, index) => {
      const sessionValidLaps = session.lapTimes.filter((lap) => lap.isValid);
      if (sessionValidLaps.length === 0) return;

      const bestLap = Math.min(...sessionValidLaps.map((lap) => lap.lapTime));
      const averageLap =
        sessionValidLaps.reduce((sum, lap) => sum + lap.lapTime, 0) /
        sessionValidLaps.length;

      const consistency = this.calculateStandardDeviation(
        sessionValidLaps.map((lap) => lap.lapTime)
      );

      let improvement = 0;
      if (index > 0) {
        const prevSession = sessionsSorted[index - 1];
        const prevValidLaps = prevSession.lapTimes.filter((lap) => lap.isValid);
        if (prevValidLaps.length > 0) {
          const prevBestLap = Math.min(...prevValidLaps.map((lap) => lap.lapTime));
          improvement = ((prevBestLap - bestLap) / prevBestLap) * 100;
        }
      }

      trends.push({
        sessionIndex: index,
        sessionName: session.eventName,
        bestLap,
        averageLap,
        improvement,
        consistency,
      });
    });

    return trends;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.sessions.clear();
    this.allLapTimes = [];
  }

  /**
   * Export aggregated data as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        sessions: Array.from(this.sessions.values()),
        stats: this.calculateStats(),
        trends: this.getTrends(),
      },
      null,
      2
    );
  }

  /**
   * Export aggregated data as CSV
   */
  exportAsCSV(): string {
    const headers = [
      'Lap #',
      'Time',
      'Event',
      'Date',
      'Track',
      'Source',
      'Position',
      'Gap',
      'Delta to Best',
      'Notes',
    ];

    const rows = this.allLapTimes.map((lap) => [
      lap.lapNumber,
      this.formatLapTime(lap.lapTime),
      lap.eventName,
      lap.eventDate,
      lap.trackName,
      lap.source,
      lap.position || '',
      lap.gap ? this.formatLapTime(lap.gap) : '',
      lap.deltaToSessionBest ? this.formatLapTime(lap.deltaToSessionBest) : '',
      lap.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private unifySpeedhiveLap(
    lap: SpeedhiveLapTime,
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string
  ): UnifiedLapTime {
    return {
      id: lap.id,
      source: 'speedhive',
      eventId,
      eventName,
      eventDate,
      trackName,
      lapNumber: lap.lapNumber,
      lapTime: lap.lapTime,
      position: lap.position,
      gap: lap.gap,
      isValid: lap.isValid,
      timestamp: lap.timestamp,
    };
  }

  private unifyAlphaRacehubLap(
    lap: AlphaRacehubLapTime,
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string
  ): UnifiedLapTime {
    return {
      id: lap.id,
      source: 'alpha_racehub',
      eventId,
      eventName,
      eventDate,
      trackName,
      lapNumber: lap.lapNumber,
      lapTime: lap.lapTime,
      position: lap.position,
      gap: lap.gap,
      isValid: lap.isValid,
      timestamp: lap.timestamp,
      notes: lap.notes,
    };
  }

  private unifyRaceMonitorLap(
    lap: RaceMonitorLapTime,
    eventId: string,
    eventName: string,
    eventDate: string,
    trackName: string
  ): UnifiedLapTime {
    return {
      id: lap.id,
      source: 'race_monitor',
      eventId,
      eventName,
      eventDate,
      trackName,
      lapNumber: lap.lapNumber,
      lapTime: lap.lapTime,
      position: lap.position,
      gap: lap.gap,
      isValid: lap.isValid && !lap.isPenalty,
      timestamp: lap.timestamp,
    };
  }

  private computeDeltas(): void {
    const validLaps = this.allLapTimes.filter((lap) => lap.isValid);
    if (validLaps.length === 0) return;

    const overallBestLap = Math.min(...validLaps.map((lap) => lap.lapTime));

    // Group by session
    const lapsBySession = new Map<string, UnifiedLapTime[]>();
    this.allLapTimes.forEach((lap) => {
      const key = `${lap.eventId}-${lap.source}`;
      if (!lapsBySession.has(key)) {
        lapsBySession.set(key, []);
      }
      lapsBySession.get(key)!.push(lap);
    });

    // Compute deltas
    this.allLapTimes.forEach((lap) => {
      lap.deltaToOverallBest = lap.lapTime - overallBestLap;

      const sessionKey = `${lap.eventId}-${lap.source}`;
      const sessionLaps = lapsBySession.get(sessionKey) || [];
      const sessionValidLaps = sessionLaps.filter((l) => l.isValid);
      if (sessionValidLaps.length > 0) {
        const sessionBestLap = Math.min(...sessionValidLaps.map((l) => l.lapTime));
        lap.deltaToSessionBest = lap.lapTime - sessionBestLap;
      }

      const lapIndex = sessionLaps.indexOf(lap);
      if (lapIndex > 0) {
        const previousLap = sessionLaps[lapIndex - 1];
        lap.improvementFromPrevious = previousLap.lapTime - lap.lapTime;
      }
    });
  }

  private calculateTrend(): { direction: 'improving' | 'declining' | 'stable'; improvementRate: number; consistencyScore: number } {
    const trends = this.getTrends();
    if (trends.length < 2) {
      return {
        direction: 'stable',
        improvementRate: 0,
        consistencyScore: 100,
      };
    }

    // Calculate average improvement rate
    const improvements = trends.slice(1).map((t) => t.improvement);
    const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;

    // Determine direction
    let direction: 'improving' | 'declining' | 'stable' = 'stable';
    if (avgImprovement > 0.5) {
      direction = 'improving';
    } else if (avgImprovement < -0.5) {
      direction = 'declining';
    }

    // Calculate consistency score (0-100, higher is better)
    const consistencies = trends.map((t) => t.consistency);
    const avgConsistency = consistencies.reduce((a, b) => a + b, 0) / consistencies.length;
    const consistencyScore = Math.max(0, Math.min(100, 100 - avgConsistency / 100));

    return {
      direction,
      improvementRate: avgImprovement,
      consistencyScore,
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  private formatLapTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let aggregatorInstance: LapAggregator | null = null;

export function getLapAggregator(): LapAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new LapAggregator();
  }
  return aggregatorInstance;
}

export function createNewAggregator(): LapAggregator {
  return new LapAggregator();
}
