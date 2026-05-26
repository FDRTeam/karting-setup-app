import type { WeatherData } from "@/lib/types";

export type { WeatherData };

const OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";

export interface WeatherParams {
  latitude: number;
  longitude: number;
}

/**
 * Fetch current weather and forecast from Open-Meteo API via backend proxy
 * Uses tRPC endpoint to avoid CORS issues
 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    // Get the API base URL
    const apiBaseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host.replace('8081', '3000')}`
      : 'http://localhost:3000';
    
    // Encode input using superjson format (required by tRPC)
    const input = { json: { latitude, longitude } };
    
    // Call the backend tRPC endpoint
    const response = await fetch(
      `${apiBaseUrl}/api/trpc/weather.fetchWeather?input=${encodeURIComponent(JSON.stringify(input))}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // tRPC returns data in result.data.json.data field (superjson wrapped)
    // The structure is: { result: { data: { json: { success: true, data: { ... } } } } }
    let weatherData = data.result?.data?.json?.data || data.result?.data?.json || data.result?.data?.data || data.result?.data || data.data || data;
    
    // If it's wrapped in a success object, unwrap it
    if (weatherData.success && weatherData.data) {
      weatherData = weatherData.data;
    }

    return {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      windDirection: weatherData.windDirection,
      trackAsphaltTemp: weatherData.trackAsphaltTemp,
      conditions: weatherData.conditions,
      timestamp: weatherData.timestamp,
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    // Return fallback weather data so the app doesn't break
    return {
      temperature: 20,
      humidity: 60,
      windSpeed: 15,
      windDirection: 180,
      trackAsphaltTemp: 28,
      conditions: "Unknown",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Convert WMO weather code to readable condition
 * https://www.open-meteo.com/en/docs
 */
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Hail",
  };

  return conditions[code] || "Unknown";
}

/**
 * Geocode track name to coordinates
 * Uses Open-Meteo Geocoding API (also free, no key required)
 */
export async function geocodeTrack(trackName: string): Promise<WeatherParams> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trackName)}&count=1&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`Track not found: ${trackName}`);
    }

    const result = data.results[0];

    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    console.error("Failed to geocode track:", error);
    throw error;
  }
}

/**
 * Fetch track asphalt temperature from ThingSpeak channel
 * SEPARATE from weather data - only for real track temperature sensor
 */
export async function fetchThingSpeakTrackTemp(
  channelId: number,
  readApiKey: string,
  fieldNumber: number = 1
): Promise<number | null> {
  try {
    console.log(`[ThingSpeak] Fetching channel ${channelId}, field ${fieldNumber}`);
    const url = `https://api.thingspeak.com/channels/${channelId}/fields/${fieldNumber}/last.json?api_key=${readApiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[ThingSpeak] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`[ThingSpeak] API response:`, data);

    // Get the field value (field1, field2, etc.)
    const fieldKey = `field${fieldNumber}`;
    const fieldValue = data[fieldKey];

    if (!fieldValue) {
      console.warn(`[ThingSpeak] No data in ${fieldKey} from channel ${channelId}`);
      return null;
    }

    const temperature = parseFloat(fieldValue);

    if (isNaN(temperature)) {
      console.warn(`[ThingSpeak] Invalid temperature value: ${fieldValue}`);
      return null;
    }

    console.log(`[ThingSpeak] Successfully fetched temperature: ${temperature}°F`);
    return temperature;
  } catch (error) {
    console.error("[ThingSpeak] Failed to fetch:", error);
    return null;
  }
}
