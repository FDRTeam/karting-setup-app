import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UnifiedLapTime, LapSession } from './lap-aggregator';

const LAP_AGGREGATION_KEY = 'lap_aggregation_data';
const LAP_SESSIONS_KEY = 'lap_sessions';
const LIVE_LAP_TIMES_KEY = 'live_lap_times';

/**
 * Save aggregated lap data to AsyncStorage
 */
export async function saveAggregatedLapData(data: {
  sessions: LapSession[];
  lapTimes: UnifiedLapTime[];
  lastUpdated: string;
}): Promise<void> {
  try {
    await AsyncStorage.setItem(LAP_AGGREGATION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save aggregated lap data:', error);
    throw error;
  }
}

/**
 * Load aggregated lap data from AsyncStorage
 */
export async function loadAggregatedLapData(): Promise<{
  sessions: LapSession[];
  lapTimes: UnifiedLapTime[];
  lastUpdated: string;
} | null> {
  try {
    const data = await AsyncStorage.getItem(LAP_AGGREGATION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load aggregated lap data:', error);
    return null;
  }
}

/**
 * Save individual lap session
 */
export async function saveLapSession(session: LapSession): Promise<void> {
  try {
    const sessions = await getAllLapSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    await AsyncStorage.setItem(LAP_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save lap session:', error);
    throw error;
  }
}

/**
 * Get all saved lap sessions
 */
export async function getAllLapSessions(): Promise<LapSession[]> {
  try {
    const data = await AsyncStorage.getItem(LAP_SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get lap sessions:', error);
    return [];
  }
}

/**
 * Get a single lap session by ID
 */
export async function getLapSession(sessionId: string): Promise<LapSession | null> {
  try {
    const sessions = await getAllLapSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  } catch (error) {
    console.error('Failed to get lap session:', error);
    return null;
  }
}

/**
 * Delete a lap session
 */
export async function deleteLapSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getAllLapSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(LAP_SESSIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete lap session:', error);
    throw error;
  }
}

/**
 * Save live lap times (for real-time tracking)
 */
export async function saveLiveLapTimes(
  eventId: string,
  lapTimes: UnifiedLapTime[]
): Promise<void> {
  try {
    const allLive = await getAllLiveLapTimes();
    allLive[eventId] = {
      eventId,
      lapTimes,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(LIVE_LAP_TIMES_KEY, JSON.stringify(allLive));
  } catch (error) {
    console.error('Failed to save live lap times:', error);
    throw error;
  }
}

/**
 * Get live lap times for an event
 */
export async function getLiveLapTimes(
  eventId: string
): Promise<UnifiedLapTime[] | null> {
  try {
    const allLive = await getAllLiveLapTimes();
    return allLive[eventId]?.lapTimes || null;
  } catch (error) {
    console.error('Failed to get live lap times:', error);
    return null;
  }
}

/**
 * Get all live lap times
 */
export async function getAllLiveLapTimes(): Promise<
  Record<string, { eventId: string; lapTimes: UnifiedLapTime[]; lastUpdated: string }>
> {
  try {
    const data = await AsyncStorage.getItem(LIVE_LAP_TIMES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to get all live lap times:', error);
    return {};
  }
}

/**
 * Clear live lap times for an event
 */
export async function clearLiveLapTimes(eventId: string): Promise<void> {
  try {
    const allLive = await getAllLiveLapTimes();
    delete allLive[eventId];
    await AsyncStorage.setItem(LIVE_LAP_TIMES_KEY, JSON.stringify(allLive));
  } catch (error) {
    console.error('Failed to clear live lap times:', error);
    throw error;
  }
}

/**
 * Clear all aggregated lap data
 */
export async function clearAllLapData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAP_AGGREGATION_KEY);
    await AsyncStorage.removeItem(LAP_SESSIONS_KEY);
    await AsyncStorage.removeItem(LIVE_LAP_TIMES_KEY);
  } catch (error) {
    console.error('Failed to clear lap data:', error);
    throw error;
  }
}

/**
 * Export all lap data
 */
export async function exportAllLapData(): Promise<string> {
  try {
    const aggregated = await loadAggregatedLapData();
    const sessions = await getAllLapSessions();
    const live = await getAllLiveLapTimes();

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      aggregated,
      sessions,
      live,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export lap data:', error);
    throw error;
  }
}

/**
 * Get storage usage statistics
 */
export async function getLapStorageStats(): Promise<{
  aggregatedSize: number;
  sessionsCount: number;
  liveEventsCount: number;
  totalLapTimes: number;
}> {
  try {
    const aggregated = await loadAggregatedLapData();
    const sessions = await getAllLapSessions();
    const live = await getAllLiveLapTimes();

    const aggregatedSize = aggregated
      ? JSON.stringify(aggregated).length
      : 0;

    const totalLapTimes = (aggregated?.lapTimes.length || 0) +
      sessions.reduce((sum, s) => sum + s.lapTimes.length, 0) +
      Object.values(live).reduce((sum, l) => sum + l.lapTimes.length, 0);

    return {
      aggregatedSize,
      sessionsCount: sessions.length,
      liveEventsCount: Object.keys(live).length,
      totalLapTimes,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      aggregatedSize: 0,
      sessionsCount: 0,
      liveEventsCount: 0,
      totalLapTimes: 0,
    };
  }
}
