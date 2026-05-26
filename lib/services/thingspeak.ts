/**
 * ThingSpeak Integration Service
 * Fetches real-time asphalt temperature from IoT sensors via ThingSpeak API
 * Supports both focused (Field 1) and wide (Field 2) temperature sensors
 */

export interface AsphaltTemperatureData {
  focused: number; // Field 1: Focused sensor in Fahrenheit
  wide: number; // Field 2: Wide sensor in Fahrenheit
  unit: "F" | "C";
  timestamp: string;
  trackName: string;
  channelId: number;
}

// Track-to-ThingSpeak channel mapping
const TRACK_THINGSPEAK_MAP: Record<string, { channelId: number; apiKey: string; fields: number[] }> = {
  "Norway Motorsports Park": {
    channelId: 3318650,
    apiKey: "SWYBUWF7NBBLQP3E",
    fields: [1], // Read Field 1 only
  },
  "Kart Circuit Autobahn": {
    channelId: 3314180,
    apiKey: "JPDX92WOEDWRIYN7",
    fields: [3], // Read Field 3 only
  },
  // Add more tracks as you set up additional sensors
  // "K1 Circuit-IN": { channelId: 123456, apiKey: "YOUR_API_KEY", fields: [1] },
  // "Road America": { channelId: 789012, apiKey: "YOUR_API_KEY", fields: [1] },
};

/**
 * Fetch asphalt temperature from ThingSpeak for a specific track
 * Returns both focused (Field 1) and wide (Field 2) temperature readings
 */
export async function getAsphaltTemperature(
  trackName: string,
  tempUnit: "F" | "C" = "F"
): Promise<AsphaltTemperatureData | null> {
  try {
    console.log(`[ThingSpeak] Fetching temperature for track: ${trackName}`);
    const config = TRACK_THINGSPEAK_MAP[trackName];
    if (!config) {
      console.log(`[ThingSpeak] No ThingSpeak sensor configured for track: ${trackName}`);
      console.log(`[ThingSpeak] Available tracks: ${Object.keys(TRACK_THINGSPEAK_MAP).join(", ")}`);
      return null;
    }
    console.log(`[ThingSpeak] Found config for ${trackName}, fetching from channel ${config.channelId}`);

    // ThingSpeak API endpoint to get the latest entry
    const url = `https://api.thingspeak.com/channels/${config.channelId}/feeds.json?api_key=${config.apiKey}&results=1`;

    console.log(`[ThingSpeak] Fetching from URL: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ThingSpeak API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[ThingSpeak] API Response:`, data);

    if (!data.feeds || data.feeds.length === 0) {
      console.log(`[ThingSpeak] No data available from ThingSpeak for ${trackName}`);
      return null;
    }

    const latestFeed = data.feeds[0];
    console.log(`[ThingSpeak] Latest feed:`, latestFeed);
    
    // Get the configured fields for this track
    const fields = config.fields;
    let focusedF: number | null = null;
    let wideF: number | null = null;
    
    // Extract values from the configured fields
    if (fields.includes(1)) focusedF = parseFloat(latestFeed.field1);
    if (fields.includes(2)) wideF = parseFloat(latestFeed.field2);
    if (fields.includes(3)) focusedF = parseFloat(latestFeed.field3);
    if (fields.includes(4)) wideF = parseFloat(latestFeed.field4);
    if (fields.includes(5)) focusedF = parseFloat(latestFeed.field5);
    if (fields.includes(6)) wideF = parseFloat(latestFeed.field6);
    if (fields.includes(7)) focusedF = parseFloat(latestFeed.field7);
    if (fields.includes(8)) wideF = parseFloat(latestFeed.field8);
    
    // If only one field is configured, use it as focused
    if (fields.length === 1 && focusedF === null) {
      focusedF = parseFloat(latestFeed[`field${fields[0]}`]);
      wideF = focusedF; // Use same value for wide
    }
    
    console.log(`[ThingSpeak] Parsed values - focused: ${focusedF}, wide: ${wideF}`);

    if (focusedF === null || isNaN(focusedF)) {
      console.log(`[ThingSpeak] Invalid temperature data for fields ${fields.join(", ")}`);
      return null;
    }

    // Convert to requested unit if needed
    const focused = tempUnit === "C" ? celsiusFromFahrenheit(focusedF) : focusedF;
    const wide = wideF !== null && !isNaN(wideF) ? (tempUnit === "C" ? celsiusFromFahrenheit(wideF) : wideF) : focused;

    return {
      focused: Math.round(focused * 10) / 10, // Round to 1 decimal
      wide: Math.round(wide * 10) / 10, // Round to 1 decimal
      unit: tempUnit,
      timestamp: latestFeed.created_at,
      trackName,
      channelId: config.channelId,
    };
  } catch (error) {
    console.error(`Error fetching asphalt temperature from ThingSpeak:`, error);
    return null;
  }
}

/**
 * Fetch asphalt temperature for multiple tracks
 */
export async function getMultipleAsphaltTemperatures(
  trackNames: string[],
  tempUnit: "F" | "C" = "F"
): Promise<Record<string, AsphaltTemperatureData | null>> {
  const results: Record<string, AsphaltTemperatureData | null> = {};

  for (const trackName of trackNames) {
    results[trackName] = await getAsphaltTemperature(trackName, tempUnit);
  }

  return results;
}

/**
 * Get list of tracks with configured sensors
 */
export function getTracksWithSensors(): string[] {
  return Object.keys(TRACK_THINGSPEAK_MAP);
}

/**
 * Add or update ThingSpeak configuration for a track
 * (Call this to add new sensor channels)
 */
export function configureTrackSensor(
  trackName: string,
  channelId: number,
  apiKey: string,
  fields: number[] = [1]
): void {
  TRACK_THINGSPEAK_MAP[trackName] = {
    channelId,
    apiKey,
    fields,
  };
}

/**
 * Helper: Convert Fahrenheit to Celsius
 */
function celsiusFromFahrenheit(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Helper: Convert Celsius to Fahrenheit
 */
function fahrenheitFromCelsius(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Format temperature for display
 */
export function formatTemperature(temp: number, unit: "F" | "C"): string {
  return `${temp.toFixed(1)}°${unit}`;
}

/**
 * Format both focused and wide temperatures for display
 */
export function formatDualTemperatures(
  focused: number,
  wide: number,
  unit: "F" | "C"
): { focused: string; wide: string } {
  return {
    focused: `${focused.toFixed(1)}°${unit}`,
    wide: `${wide.toFixed(1)}°${unit}`,
  };
}

/**
 * Get temperature color based on value (for UI visualization)
 * Cold (blue) → Warm (green) → Hot (red)
 */
export function getTemperatureColor(temperatureF: number): string {
  if (temperatureF < 60) return "#3b82f6"; // Blue - cold
  if (temperatureF < 80) return "#10b981"; // Green - moderate
  if (temperatureF < 100) return "#f59e0b"; // Amber - warm
  return "#ef4444"; // Red - hot
}

/**
 * Calculate average of focused and wide temperatures
 */
export function getAverageTemperature(focused: number, wide: number): number {
  return (focused + wide) / 2;
}
