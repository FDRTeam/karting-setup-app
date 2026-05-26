import { useState, useEffect } from "react";
import {
  getAsphaltTemperature,
  formatDualTemperatures,
  getTemperatureColor,
  getAverageTemperature,
  type AsphaltTemperatureData,
} from "@/lib/services/thingspeak";
import { useColors } from "./use-colors";

interface UseAsphaltTemperatureOptions {
  trackName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

/**
 * Hook to fetch and manage asphalt temperature data from ThingSpeak
 * Returns both focused (Field 1) and wide (Field 2) temperature readings
 */
export function useAsphaltTemperature(
  options: UseAsphaltTemperatureOptions = {}
) {
  const { trackName, autoRefresh = true, refreshInterval = 60000 } = options; // Default: refresh every 60 seconds
  const [temperature, setTemperature] = useState<AsphaltTemperatureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colors = useColors();

  const fetchTemperature = async () => {
    console.log(`[useAsphaltTemperature] fetchTemperature called with trackName: ${trackName}`);
    if (!trackName) {
      console.log(`[useAsphaltTemperature] No trackName provided`);
      setTemperature(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[useAsphaltTemperature] Calling getAsphaltTemperature for: ${trackName}`);
      const data = await getAsphaltTemperature(trackName, "F");
      console.log(`[useAsphaltTemperature] Got data:`, data);
      if (data) {
        setTemperature(data);
      } else {
        console.log(`[useAsphaltTemperature] No data returned from getAsphaltTemperature`);
        setError("No sensor data available for this track");
      }
    } catch (err) {
      console.error(`[useAsphaltTemperature] Error:`, err);
      setError(err instanceof Error ? err.message : "Failed to fetch temperature");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when trackName changes
  useEffect(() => {
    console.log(`[useAsphaltTemperature] useEffect triggered, trackName: ${trackName}`);
    fetchTemperature();
  }, [trackName]);

  // Set up auto-refresh interval
  useEffect(() => {
    console.log(`[useAsphaltTemperature] Auto-refresh setup - autoRefresh: ${autoRefresh}, trackName: ${trackName}, interval: ${refreshInterval}`);
    if (!autoRefresh || !trackName) return;

    const interval = setInterval(fetchTemperature, refreshInterval);
    return () => clearInterval(interval);
  }, [trackName, autoRefresh, refreshInterval]);

  return {
    temperature,
    loading,
    error,
    refresh: fetchTemperature,
    formatted: temperature
      ? formatDualTemperatures(temperature.focused, temperature.wide, temperature.unit)
      : null,
    average: temperature ? getAverageTemperature(temperature.focused, temperature.wide) : null,
    focusedColor: temperature ? getTemperatureColor(temperature.focused) : colors.muted,
    wideColor: temperature ? getTemperatureColor(temperature.wide) : colors.muted,
  };
}
