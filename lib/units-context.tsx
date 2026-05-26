import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SpeedUnit = "mph" | "kmh";
export type TemperatureUnit = "F" | "C";
export type DistanceUnit = "inches" | "mm";

export interface UnitsSettings {
  speed: SpeedUnit;
  temperature: TemperatureUnit;
  distance: DistanceUnit;
}

interface UnitsContextType {
  units: UnitsSettings;
  setUnits: (units: UnitsSettings) => Promise<void>;
  convertSpeed: (value: number, from: SpeedUnit, to: SpeedUnit) => number;
  convertTemperature: (value: number, from: TemperatureUnit, to: TemperatureUnit) => number;
  convertDistance: (value: number, from: DistanceUnit, to: DistanceUnit) => number;
  formatSpeed: (value: number) => string;
  formatTemperature: (value: number) => string;
  formatDistance: (value: number) => string;
}

const defaultUnits: UnitsSettings = {
  speed: "mph",
  temperature: "F",
  distance: "inches",
};

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnitsState] = useState<UnitsSettings>(defaultUnits);
  const [isLoading, setIsLoading] = useState(true);

  // Load units from storage on mount
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const stored = await AsyncStorage.getItem("units_settings");
        if (stored) {
          setUnitsState(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load units settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnits();
  }, []);

  const setUnits = async (newUnits: UnitsSettings) => {
    try {
      setUnitsState(newUnits);
      await AsyncStorage.setItem("units_settings", JSON.stringify(newUnits));
    } catch (error) {
      console.error("Failed to save units settings:", error);
    }
  };

  const convertSpeed = (value: number, from: SpeedUnit, to: SpeedUnit): number => {
    if (from === to) return value;
    if (from === "mph" && to === "kmh") return value * 1.60934;
    if (from === "kmh" && to === "mph") return value / 1.60934;
    return value;
  };

  const convertTemperature = (
    value: number,
    from: TemperatureUnit,
    to: TemperatureUnit
  ): number => {
    if (from === to) return value;
    if (from === "F" && to === "C") return ((value - 32) * 5) / 9;
    if (from === "C" && to === "F") return (value * 9) / 5 + 32;
    return value;
  };

  const convertDistance = (value: number, from: DistanceUnit, to: DistanceUnit): number => {
    if (from === to) return value;
    if (from === "inches" && to === "mm") return value * 25.4;
    if (from === "mm" && to === "inches") return value / 25.4;
    return value;
  };

  const formatSpeed = (value: number): string => {
    return `${value.toFixed(1)} ${units.speed}`;
  };

  const formatTemperature = (value: number): string => {
    return `${value.toFixed(1)}°${units.temperature}`;
  };

  const formatDistance = (value: number): string => {
    return `${value.toFixed(2)} ${units.distance}`;
  };

  if (isLoading) {
    return null;
  }

  return (
    <UnitsContext.Provider
      value={{
        units,
        setUnits,
        convertSpeed,
        convertTemperature,
        convertDistance,
        formatSpeed,
        formatTemperature,
        formatDistance,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits(): UnitsContextType {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error("useUnits must be used within UnitsProvider");
  }
  return context;
}
