/**
 * Timing Platform Registry
 * 
 * Unified interface for multiple timing platforms used by karting tracks.
 * Supports: Speedhive, Race Monitor, Alpha Racehub, MyLaps, Timing Solutions, TrackTime
 */

export type TimingPlatformType = 
  | 'speedhive'
  | 'race-monitor'
  | 'alpha-racehub'
  | 'mylaps'
  | 'timing-solutions'
  | 'tracktime'
  | 'manual';

export interface TimingPlatformConfig {
  id: TimingPlatformType;
  name: string;
  description: string;
  icon: string;
  requiresAuth: boolean;
  authFields: AuthField[];
  supportsLiveTracking: boolean;
  supportsEventSelection: boolean;
  supportsParticipantSelection: boolean;
  refreshInterval: number; // milliseconds
  apiEndpoint?: string;
  websocketEndpoint?: string;
  documentation?: string;
}

export interface AuthField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url';
  placeholder?: string;
  required: boolean;
  hint?: string;
}

export interface TimingPlatformCredentials {
  platform: TimingPlatformType;
  credentials: Record<string, string>;
  savedAt: string;
  expiresAt?: string;
}

export interface LiveLapData {
  participantId: string;
  participantName: string;
  lapNumber: number;
  lapTime: number; // milliseconds
  timestamp: string;
  position: number;
  gap: number; // gap to leader
  isValid: boolean;
  sector1?: number;
  sector2?: number;
  sector3?: number;
  speed?: number;
  temperature?: number;
}

export interface LiveEventData {
  eventId: string;
  eventName: string;
  trackName: string;
  sessionType: 'practice' | 'qualifying' | 'race' | 'test';
  status: 'not-started' | 'live' | 'finished';
  currentLap: number;
  totalLaps?: number;
  timeRemaining?: number;
  participants: LiveParticipantData[];
  updatedAt: string;
}

export interface LiveParticipantData {
  participantId: string;
  participantName: string;
  kartNumber: string;
  position: number;
  bestLap: number;
  lastLap: number;
  lapCount: number;
  gap: number;
  isActive: boolean;
  lapHistory: LiveLapData[];
}

/**
 * Timing Platform Registry
 * 
 * Central registry of all supported timing platforms with their configurations
 */
export const TIMING_PLATFORM_REGISTRY: Record<TimingPlatformType, TimingPlatformConfig> = {
  speedhive: {
    id: 'speedhive',
    name: 'Speedhive (MYLAPS)',
    description: 'Popular timing system used by major karting tracks worldwide',
    icon: '⏱️',
    requiresAuth: false,
    authFields: [
      {
        key: 'eventId',
        label: 'Event ID',
        type: 'text',
        placeholder: 'e.g., 12345',
        required: true,
        hint: 'Find in Speedhive event URL',
      },
    ],
    supportsLiveTracking: true,
    supportsEventSelection: true,
    supportsParticipantSelection: true,
    refreshInterval: 5000,
    apiEndpoint: 'https://usersandproducts-api.speedhive.com',
    documentation: 'https://speedhive.com/api',
  },
  'race-monitor': {
    id: 'race-monitor',
    name: 'Race Monitor',
    description: 'Real-time timing and scoring system for motorsports',
    icon: '🏁',
    requiresAuth: true,
    authFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        hint: 'Get from Race Monitor dashboard',
      },
      {
        key: 'eventId',
        label: 'Event ID',
        type: 'text',
        required: true,
        placeholder: 'e.g., event_123',
      },
    ],
    supportsLiveTracking: true,
    supportsEventSelection: true,
    supportsParticipantSelection: true,
    refreshInterval: 3000,
    apiEndpoint: 'https://api.racemonitor.com',
    documentation: 'https://racemonitor.com/developers',
  },
  'alpha-racehub': {
    id: 'alpha-racehub',
    name: 'Alpha Racehub',
    description: 'Timing system with CSV export and web interface',
    icon: '📊',
    requiresAuth: false,
    authFields: [
      {
        key: 'csvUrl',
        label: 'CSV Export URL',
        type: 'url',
        required: true,
        placeholder: 'https://...',
        hint: 'Export lap times as CSV from Alpha Racehub',
      },
    ],
    supportsLiveTracking: false,
    supportsEventSelection: false,
    supportsParticipantSelection: false,
    refreshInterval: 30000,
    documentation: 'https://alpharacehub.com',
  },
  mylaps: {
    id: 'mylaps',
    name: 'MyLaps',
    description: 'Professional timing and data acquisition system',
    icon: '⏰',
    requiresAuth: true,
    authFields: [
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        required: true,
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true,
      },
      {
        key: 'eventCode',
        label: 'Event Code',
        type: 'text',
        required: true,
        placeholder: 'e.g., RACE2024',
      },
    ],
    supportsLiveTracking: true,
    supportsEventSelection: true,
    supportsParticipantSelection: true,
    refreshInterval: 2000,
    apiEndpoint: 'https://api.mylaps.com',
    documentation: 'https://mylaps.com/api',
  },
  'timing-solutions': {
    id: 'timing-solutions',
    name: 'Timing Solutions',
    description: 'Timing system common in regional karting series',
    icon: '⏲️',
    requiresAuth: true,
    authFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'trackCode',
        label: 'Track Code',
        type: 'text',
        required: true,
      },
    ],
    supportsLiveTracking: true,
    supportsEventSelection: true,
    supportsParticipantSelection: true,
    refreshInterval: 5000,
    apiEndpoint: 'https://api.timingsolutions.com',
    documentation: 'https://timingsolutions.com/api',
  },
  tracktime: {
    id: 'tracktime',
    name: 'TrackTime',
    description: 'Mobile-first timing platform for local events',
    icon: '📱',
    requiresAuth: false,
    authFields: [
      {
        key: 'eventCode',
        label: 'Event Code',
        type: 'text',
        required: true,
        placeholder: 'e.g., TRACK123',
        hint: 'Displayed at track or in event details',
      },
    ],
    supportsLiveTracking: true,
    supportsEventSelection: false,
    supportsParticipantSelection: true,
    refreshInterval: 5000,
    websocketEndpoint: 'wss://ws.tracktime.app',
    documentation: 'https://tracktime.app/docs',
  },
  manual: {
    id: 'manual',
    name: 'Manual Entry',
    description: 'Manually enter lap times from any timing system',
    icon: '✏️',
    requiresAuth: false,
    authFields: [],
    supportsLiveTracking: false,
    supportsEventSelection: false,
    supportsParticipantSelection: false,
    refreshInterval: 0,
    documentation: 'Manual entry guide',
  },
};

/**
 * Get platform configuration by ID
 */
export function getTimingPlatformConfig(
  platformId: TimingPlatformType
): TimingPlatformConfig | null {
  return TIMING_PLATFORM_REGISTRY[platformId] || null;
}

/**
 * Get all available platforms
 */
export function getAllTimingPlatforms(): TimingPlatformConfig[] {
  return Object.values(TIMING_PLATFORM_REGISTRY);
}

/**
 * Get platforms that support live tracking
 */
export function getLiveTrackingPlatforms(): TimingPlatformConfig[] {
  return Object.values(TIMING_PLATFORM_REGISTRY).filter(
    (p) => p.supportsLiveTracking
  );
}

/**
 * Get platforms that support event selection
 */
export function getEventSelectionPlatforms(): TimingPlatformConfig[] {
  return Object.values(TIMING_PLATFORM_REGISTRY).filter(
    (p) => p.supportsEventSelection
  );
}

/**
 * Get platforms that require authentication
 */
export function getAuthRequiredPlatforms(): TimingPlatformConfig[] {
  return Object.values(TIMING_PLATFORM_REGISTRY).filter((p) => p.requiresAuth);
}

/**
 * Validate credentials for a platform
 */
export function validateCredentials(
  platformId: TimingPlatformType,
  credentials: Record<string, string>
): { valid: boolean; errors: string[] } {
  const platform = getTimingPlatformConfig(platformId);
  if (!platform) {
    return { valid: false, errors: ['Platform not found'] };
  }

  const errors: string[] = [];

  // Check required fields
  platform.authFields.forEach((field) => {
    if (field.required && !credentials[field.key]) {
      errors.push(`${field.label} is required`);
    }

    // Validate field type
    if (credentials[field.key]) {
      if (field.type === 'email' && !isValidEmail(credentials[field.key])) {
        errors.push(`${field.label} is not a valid email`);
      }
      if (field.type === 'url' && !isValidUrl(credentials[field.key])) {
        errors.push(`${field.label} is not a valid URL`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get platform by name (case-insensitive)
 */
export function getPlatformByName(name: string): TimingPlatformConfig | null {
  const platform = Object.values(TIMING_PLATFORM_REGISTRY).find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  return platform || null;
}

/**
 * Format lap time for display
 */
export function formatLapTime(lapTimeMs: number): string {
  const minutes = Math.floor(lapTimeMs / 60000);
  const seconds = Math.floor((lapTimeMs % 60000) / 1000);
  const milliseconds = lapTimeMs % 1000;

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
    .toString()
    .padStart(3, '0')}`;
}

/**
 * Format gap time for display
 */
export function formatGapTime(gapMs: number): string {
  if (gapMs === 0) return 'LEADER';
  const seconds = (gapMs / 1000).toFixed(2);
  return `+${seconds}s`;
}

/**
 * Convert lap time to milliseconds
 */
export function parseLapTime(timeString: string): number {
  // Supports formats: "1:23.456", "1:23", "123.456", "123"
  const parts = timeString.split(':');
  
  if (parts.length === 2) {
    // MM:SS.MS format
    const minutes = parseInt(parts[0], 10);
    const [seconds, ms] = parts[1].split('.');
    const secondsNum = parseInt(seconds, 10);
    const msNum = ms ? parseInt(ms.padEnd(3, '0'), 10) : 0;
    return minutes * 60000 + secondsNum * 1000 + msNum;
  } else if (parts.length === 1) {
    // SS.MS format
    const [seconds, ms] = parts[0].split('.');
    const secondsNum = parseInt(seconds, 10);
    const msNum = ms ? parseInt(ms.padEnd(3, '0'), 10) : 0;
    return secondsNum * 1000 + msNum;
  }

  return 0;
}
