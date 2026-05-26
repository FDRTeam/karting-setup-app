import axios, { AxiosInstance } from 'axios';

/**
 * Speedhive API Service
 * Integrates with MYLAPS Speedhive API for fetching race events and lap times
 * 
 * Base URL: https://api.speedhive.mylaps.com/v1
 * No authentication required for public endpoints
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SpeedhiveEvent {
  id: string;
  name: string;
  date: string; // ISO date string
  location: string;
  locationId?: string;
  eventType: 'race' | 'practice' | 'qualifying';
  status: 'scheduled' | 'active' | 'completed';
  participants?: number;
}

export interface SpeedhiveParticipant {
  id: string;
  name: string;
  number: string;
  class: string;
  team?: string;
  bestLapTime?: number; // milliseconds
  totalLaps?: number;
  position?: number;
}

export interface SpeedhiveLapTime {
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
  timestamp: string; // ISO date string
  sector1?: number; // milliseconds
  sector2?: number; // milliseconds
  sector3?: number; // milliseconds
}

export interface SpeedhiveEventResult {
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  participants: SpeedhiveParticipant[];
  lapTimes: SpeedhiveLapTime[];
  bestLap: SpeedhiveLapTime | null;
}

export interface SpeedhiveLocation {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  timezone?: string;
}

export interface SpeedhiveAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Speedhive Client
// ============================================================================

export class SpeedhiveClient {
  private client: AxiosInstance;
  private baseURL = 'https://api.speedhive.mylaps.com/v1';
  private timeout = 10000; // 10 seconds

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[Speedhive API Error]', {
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
   * @param filters - Optional filters (locationId, status, etc.)
   */
  async getEvents(filters?: {
    locationId?: string;
    status?: 'scheduled' | 'active' | 'completed';
    limit?: number;
    offset?: number;
  }): Promise<SpeedhiveEvent[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveEvent[]>>(
        '/events',
        { params: filters }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw new Error('Unable to fetch Speedhive events');
    }
  }

  /**
   * Fetch a specific event by ID
   */
  async getEvent(eventId: string): Promise<SpeedhiveEvent | null> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveEvent>>(
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
  async searchEvents(query: string): Promise<SpeedhiveEvent[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveEvent[]>>(
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
  async getEventResults(eventId: string): Promise<SpeedhiveLapTime[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveLapTime[]>>(
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
  ): Promise<SpeedhiveLapTime[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveLapTime[]>>(
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
  async getBestLap(eventId: string): Promise<SpeedhiveLapTime | null> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveLapTime>>(
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
  ): Promise<SpeedhiveLapTime | null> {
    try {
      const laps = await this.getParticipantLaps(eventId, participantId);

      if (laps.length === 0) return null;

      // Filter valid laps and find the fastest
      const validLaps = laps.filter((lap) => lap.isValid);
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
  async getEventParticipants(eventId: string): Promise<SpeedhiveParticipant[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveParticipant[]>>(
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
   * Get a specific participant's info
   */
  async getParticipant(
    eventId: string,
    participantId: string
  ): Promise<SpeedhiveParticipant | null> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveParticipant>>(
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
  // Locations API
  // ========================================================================

  /**
   * Fetch all locations
   */
  async getLocations(): Promise<SpeedhiveLocation[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveLocation[]>>(
        '/locations'
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      throw new Error('Unable to fetch Speedhive locations');
    }
  }

  /**
   * Get a specific location
   */
  async getLocation(locationId: string): Promise<SpeedhiveLocation | null> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveLocation>>(
        `/locations/${locationId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch location ${locationId}:`, error);
      return null;
    }
  }

  /**
   * Search locations by name
   */
  async searchLocations(query: string): Promise<SpeedhiveLocation[]> {
    try {
      const response = await this.client.get<SpeedhiveAPIResponse<SpeedhiveLocation[]>>(
        '/locations/search',
        { params: { q: query } }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to search locations:', error);
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
  static calculateAverageLapTime(lapTimes: SpeedhiveLapTime[]): number {
    if (lapTimes.length === 0) return 0;

    const validLaps = lapTimes.filter((lap) => lap.isValid);
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
    participants: SpeedhiveParticipant[]
  ): Map<string, SpeedhiveParticipant[]> {
    const grouped = new Map<string, SpeedhiveParticipant[]>();

    participants.forEach((participant) => {
      const classKey = participant.class || 'Unknown';
      if (!grouped.has(classKey)) {
        grouped.set(classKey, []);
      }
      grouped.get(classKey)!.push(participant);
    });

    return grouped;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let speedhiveClientInstance: SpeedhiveClient | null = null;

/**
 * Get or create Speedhive client singleton
 */
export function getSpeedhiveClient(): SpeedhiveClient {
  if (!speedhiveClientInstance) {
    speedhiveClientInstance = new SpeedhiveClient();
  }
  return speedhiveClientInstance;
}

// ============================================================================
// Convenience Functions
// ============================================================================

const client = getSpeedhiveClient();

export async function fetchSpeedhiveEvents(filters?: {
  locationId?: string;
  status?: 'scheduled' | 'active' | 'completed';
}): Promise<SpeedhiveEvent[]> {
  return client.getEvents(filters);
}

export async function fetchSpeedhiveEvent(eventId: string): Promise<SpeedhiveEvent | null> {
  return client.getEvent(eventId);
}

export async function fetchSpeedhiveLapTimes(eventId: string): Promise<SpeedhiveLapTime[]> {
  return client.getEventResults(eventId);
}

export async function fetchSpeedhiveParticipantLaps(
  eventId: string,
  participantId: string
): Promise<SpeedhiveLapTime[]> {
  return client.getParticipantLaps(eventId, participantId);
}

export async function getSpeedhiveBestLap(eventId: string): Promise<SpeedhiveLapTime | null> {
  return client.getBestLap(eventId);
}

export async function getSpeedhiveParticipantBestLap(
  eventId: string,
  participantId: string
): Promise<SpeedhiveLapTime | null> {
  return client.getParticipantBestLap(eventId, participantId);
}

export async function fetchSpeedhiveParticipants(
  eventId: string
): Promise<SpeedhiveParticipant[]> {
  return client.getEventParticipants(eventId);
}

export async function fetchSpeedhiveLocations(): Promise<SpeedhiveLocation[]> {
  return client.getLocations();
}

export async function searchSpeedhiveLocations(query: string): Promise<SpeedhiveLocation[]> {
  return client.searchLocations(query);
}

export async function searchSpeedhiveEvents(query: string): Promise<SpeedhiveEvent[]> {
  return client.searchEvents(query);
}
