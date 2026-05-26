import axios, { AxiosInstance } from 'axios';

/**
 * Race Monitor API Service
 * Integrates with Race Monitor timing platform for karting events
 * 
 * Race Monitor: https://www.racemonitor.com/
 * API Documentation: https://api.racemonitor.com/docs
 * 
 * Note: Requires API key for authentication
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RaceMonitorEvent {
  id: string;
  name: string;
  date: string; // ISO date string
  location: string;
  trackName: string;
  eventType: 'race' | 'practice' | 'qualifying' | 'heat';
  status: 'scheduled' | 'active' | 'completed';
  participants?: number;
  series?: string;
  season?: string;
}

export interface RaceMonitorParticipant {
  id: string;
  name: string;
  number: string;
  class: string;
  team?: string;
  bestLapTime?: number; // milliseconds
  totalLaps?: number;
  position?: number;
  points?: number;
}

export interface RaceMonitorLapTime {
  id: string;
  participantId: string;
  participantName: string;
  participantNumber: string;
  lapNumber: number;
  lapTime: number; // milliseconds
  position: number;
  gap: number; // gap to leader in milliseconds
  gapToNext: number; // gap to next car in milliseconds
  isValid: boolean;
  isPenalty: boolean;
  timestamp: string; // ISO date string
  sector1?: number; // milliseconds
  sector2?: number; // milliseconds
  sector3?: number; // milliseconds
  speed?: number; // km/h or mph
}

export interface RaceMonitorEventResult {
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  participants: RaceMonitorParticipant[];
  lapTimes: RaceMonitorLapTime[];
  bestLap: RaceMonitorLapTime | null;
  leaderboard: RaceMonitorParticipant[];
}

export interface RaceMonitorSeries {
  id: string;
  name: string;
  season: string;
  eventCount: number;
  participantCount: number;
}

export interface RaceMonitorAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// ============================================================================
// Race Monitor Client
// ============================================================================

export class RaceMonitorClient {
  private client: AxiosInstance;
  private baseURL = 'https://api.racemonitor.com/v1';
  private timeout = 10000; // 10 seconds
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Race Monitor API key is required');
    }

    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[Race Monitor API Error]', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        throw error;
      }
    );
  }

  // ========================================================================
  // Events API
  // ========================================================================

  /**
   * Fetch all events
   */
  async getEvents(filters?: {
    seriesId?: string;
    status?: 'scheduled' | 'active' | 'completed';
    limit?: number;
    offset?: number;
  }): Promise<RaceMonitorEvent[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorEvent[]>>(
        '/events',
        { params: filters }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw new Error('Unable to fetch Race Monitor events');
    }
  }

  /**
   * Fetch a specific event by ID
   */
  async getEvent(eventId: string): Promise<RaceMonitorEvent | null> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorEvent>>(
        `/events/${eventId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch event ${eventId}:`, error);
      throw new Error(`Unable to fetch event ${eventId}`);
    }
  }

  /**
   * Search events by name or location
   */
  async searchEvents(query: string): Promise<RaceMonitorEvent[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorEvent[]>>(
        '/events/search',
        { params: { q: query } }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to search events:', error);
      return [];
    }
  }

  // ========================================================================
  // Results API
  // ========================================================================

  /**
   * Fetch all lap times for an event
   */
  async getEventResults(eventId: string): Promise<RaceMonitorLapTime[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorLapTime[]>>(
        `/events/${eventId}/results`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch results for event ${eventId}:`, error);
      throw new Error(`Unable to fetch results for event ${eventId}`);
    }
  }

  /**
   * Fetch lap times for a specific participant in an event
   */
  async getParticipantLaps(
    eventId: string,
    participantId: string
  ): Promise<RaceMonitorLapTime[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorLapTime[]>>(
        `/events/${eventId}/participants/${participantId}/laps`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error(
        `Failed to fetch laps for participant ${participantId}:`,
        error
      );
      throw new Error(`Unable to fetch participant laps`);
    }
  }

  /**
   * Get best lap for an event
   */
  async getBestLap(eventId: string): Promise<RaceMonitorLapTime | null> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorLapTime>>(
        `/events/${eventId}/best-lap`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch best lap for event ${eventId}:`, error);
      return null;
    }
  }

  /**
   * Get best lap for a specific participant
   */
  async getParticipantBestLap(
    eventId: string,
    participantId: string
  ): Promise<RaceMonitorLapTime | null> {
    try {
      const laps = await this.getParticipantLaps(eventId, participantId);

      if (laps.length === 0) return null;

      // Filter valid laps and find the fastest
      const validLaps = laps.filter((lap) => lap.isValid && !lap.isPenalty);
      if (validLaps.length === 0) return null;

      return validLaps.reduce((best, current) =>
        current.lapTime < best.lapTime ? current : best
      );
    } catch (error) {
      console.error('Failed to get participant best lap:', error);
      return null;
    }
  }

  /**
   * Get all participants for an event
   */
  async getEventParticipants(eventId: string): Promise<RaceMonitorParticipant[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorParticipant[]>>(
        `/events/${eventId}/participants`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch participants for event ${eventId}:`, error);
      throw new Error(`Unable to fetch participants`);
    }
  }

  /**
   * Get event leaderboard
   */
  async getLeaderboard(eventId: string): Promise<RaceMonitorParticipant[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorParticipant[]>>(
        `/events/${eventId}/leaderboard`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch leaderboard for event ${eventId}:`, error);
      throw new Error(`Unable to fetch leaderboard`);
    }
  }

  /**
   * Get a specific participant's info
   */
  async getParticipant(
    eventId: string,
    participantId: string
  ): Promise<RaceMonitorParticipant | null> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorParticipant>>(
        `/events/${eventId}/participants/${participantId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch participant ${participantId}:`, error);
      return null;
    }
  }

  // ========================================================================
  // Series API
  // ========================================================================

  /**
   * Fetch all series
   */
  async getSeries(): Promise<RaceMonitorSeries[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorSeries[]>>(
        '/series'
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch series:', error);
      throw new Error('Unable to fetch Race Monitor series');
    }
  }

  /**
   * Get a specific series
   */
  async getSeriesById(seriesId: string): Promise<RaceMonitorSeries | null> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorSeries>>(
        `/series/${seriesId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch series ${seriesId}:`, error);
      return null;
    }
  }

  /**
   * Get events for a series
   */
  async getSeriesEvents(seriesId: string): Promise<RaceMonitorEvent[]> {
    try {
      const response = await this.client.get<RaceMonitorAPIResponse<RaceMonitorEvent[]>>(
        `/series/${seriesId}/events`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch events for series ${seriesId}:`, error);
      return [];
    }
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Format lap time from milliseconds to MM:SS.mmm
   */
  static formatLapTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }

  /**
   * Format gap time (can be negative for behind)
   */
  static formatGapTime(ms: number): string {
    const sign = ms < 0 ? '-' : '+';
    const absMs = Math.abs(ms);
    const seconds = Math.floor(absMs / 1000);
    const milliseconds = absMs % 1000;
    return `${sign}${seconds}.${String(milliseconds).padStart(3, '0')}`;
  }

  /**
   * Calculate average lap time
   */
  static calculateAverageLapTime(lapTimes: RaceMonitorLapTime[]): number {
    if (lapTimes.length === 0) return 0;

    const validLaps = lapTimes.filter((lap) => lap.isValid && !lap.isPenalty);
    if (validLaps.length === 0) return 0;

    const total = validLaps.reduce((sum, lap) => sum + lap.lapTime, 0);
    return Math.round(total / validLaps.length);
  }

  /**
   * Calculate lap time improvement (delta from best)
   */
  static calculateDeltaToBest(lapTime: number, bestLapTime: number): number {
    return lapTime - bestLapTime;
  }

  /**
   * Parse lap times by class/category
   */
  static groupLapsByClass(
    participants: RaceMonitorParticipant[]
  ): Map<string, RaceMonitorParticipant[]> {
    const grouped = new Map<string, RaceMonitorParticipant[]>();

    participants.forEach((participant) => {
      const classKey = participant.class || 'Unknown';
      if (!grouped.has(classKey)) {
        grouped.set(classKey, []);
      }
      grouped.get(classKey)!.push(participant);
    });

    return grouped;
  }

  /**
   * Check if lap is valid (not penalty, not invalid)
   */
  static isValidLap(lap: RaceMonitorLapTime): boolean {
    return lap.isValid && !lap.isPenalty;
  }
}

// ============================================================================
// Singleton Instance Management
// ============================================================================

let raceMonitorClientInstance: RaceMonitorClient | null = null;

/**
 * Initialize Race Monitor client with API key
 */
export function initializeRaceMonitor(apiKey: string): void {
  raceMonitorClientInstance = new RaceMonitorClient(apiKey);
}

/**
 * Get or create Race Monitor client singleton
 */
export function getRaceMonitorClient(): RaceMonitorClient {
  if (!raceMonitorClientInstance) {
    throw new Error(
      'Race Monitor client not initialized. Call initializeRaceMonitor(apiKey) first.'
    );
  }
  return raceMonitorClientInstance;
}

/**
 * Check if Race Monitor is initialized
 */
export function isRaceMonitorInitialized(): boolean {
  return raceMonitorClientInstance !== null;
}

// ============================================================================
// Convenience Functions
// ============================================================================

export async function fetchRaceMonitorEvents(filters?: {
  seriesId?: string;
  status?: 'scheduled' | 'active' | 'completed';
}): Promise<RaceMonitorEvent[]> {
  return getRaceMonitorClient().getEvents(filters);
}

export async function fetchRaceMonitorEvent(eventId: string): Promise<RaceMonitorEvent | null> {
  return getRaceMonitorClient().getEvent(eventId);
}

export async function fetchRaceMonitorLapTimes(eventId: string): Promise<RaceMonitorLapTime[]> {
  return getRaceMonitorClient().getEventResults(eventId);
}

export async function fetchRaceMonitorParticipantLaps(
  eventId: string,
  participantId: string
): Promise<RaceMonitorLapTime[]> {
  return getRaceMonitorClient().getParticipantLaps(eventId, participantId);
}

export async function getRaceMonitorBestLap(eventId: string): Promise<RaceMonitorLapTime | null> {
  return getRaceMonitorClient().getBestLap(eventId);
}

export async function getRaceMonitorParticipantBestLap(
  eventId: string,
  participantId: string
): Promise<RaceMonitorLapTime | null> {
  return getRaceMonitorClient().getParticipantBestLap(eventId, participantId);
}

export async function fetchRaceMonitorParticipants(
  eventId: string
): Promise<RaceMonitorParticipant[]> {
  return getRaceMonitorClient().getEventParticipants(eventId);
}

export async function fetchRaceMonitorLeaderboard(
  eventId: string
): Promise<RaceMonitorParticipant[]> {
  return getRaceMonitorClient().getLeaderboard(eventId);
}

export async function fetchRaceMonitorSeries(): Promise<RaceMonitorSeries[]> {
  return getRaceMonitorClient().getSeries();
}

export async function searchRaceMonitorEvents(query: string): Promise<RaceMonitorEvent[]> {
  return getRaceMonitorClient().searchEvents(query);
}
