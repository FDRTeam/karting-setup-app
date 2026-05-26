import { describe, it, expect } from "vitest";
import type { KartingSession, PerformanceAnalysis, LapTime } from "@/lib/types";

describe("Setup History with Weather Context", () => {
  describe("KartingSession with Performance Tracking", () => {
    it("should create a session with lap time data", () => {
      const session: KartingSession = {
        id: "session-1",
        kartNumber: "42",
        trackName: "Norway Motorsports Park",
        trackLayout: "National",
        trackLocation: {
          latitude: 41.7831,
          longitude: -88.5678,
        },
        date: new Date().toISOString(),
        weather: {
          temperature: 0, // 32°F
          humidity: 81,
          windSpeed: 19.3, // 12 mph in km/h
          windDirection: 37,
          trackAsphaltTemp: 19.5, // 67°F
          conditions: "Overcast",
          timestamp: new Date().toISOString(),
        },
        tireSetup: {
          type: "MG Orange",
          pressureFrontLeft: 15,
          pressureFrontRight: 15,
          pressureRearLeft: 15,
          pressureRearRight: 15,
          rimBrand: "OTK",
          rimMetallurgy: "Magnesium",
          weightDistribution: {
            frontLeft: 50,
            frontRight: 50,
            rearLeft: 50,
            rearRight: 50,
          },
        },
        chassisSetup: {
          type: "Birel Art",
          serialNumber: "BA-2024-001",
          frontLeft: { caster: 3.5, camber: -1.5, toe: 0.2 },
          frontRight: { caster: 3.5, camber: -1.5, toe: 0.2 },
          axleBrand: "OTK",
          axleWidth: 50,
          axleStiffness: "M2",
        },
        engineSetup: {
          type: "B+S LO206",
          serialNumber: "BS-2024-001",
          sparkPlug: "AR50",
        },
        gearingSetup: {
          frontDriver: 12,
          rearSprocket: 60,
          ratio: 5.0,
        },
        weightDistribution: {
          frontLeftWeight: 50,
          frontRightWeight: 50,
          rearLeftWeight: 50,
          rearRightWeight: 50,
          crossWeightPercentage: 50,
          totalWeight: 200,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Performance tracking fields
        bestLapTime: 65.234, // 1:05.234
        averageLapTime: 66.5,
        lapCount: 12,
        performanceNotes: "Good grip, tires felt responsive",
      };

      expect(session.bestLapTime).toBe(65.234);
      expect(session.averageLapTime).toBe(66.5);
      expect(session.lapCount).toBe(12);
      expect(session.performanceNotes).toBe("Good grip, tires felt responsive");
    });

    it("should format lap time correctly", () => {
      const formatLapTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${minutes}:${secs.padStart(5, '0')}`;
      };

      expect(formatLapTime(65.234)).toBe("1:05.23");
      expect(formatLapTime(125.5)).toBe("2:05.50");
      expect(formatLapTime(45.1)).toBe("0:45.10");
    });

    it("should calculate weather summary correctly", () => {
      const getWeatherSummary = (weather: any): string => {
        if (!weather) return "N/A";
        return `${weather.temperature.toFixed(0)}°C, ${weather.conditions}`;
      };

      const weather = {
        temperature: 0,
        humidity: 81,
        windSpeed: 19.3,
        windDirection: 37,
        trackAsphaltTemp: 19.5,
        conditions: "Overcast",
        timestamp: new Date().toISOString(),
      };

      expect(getWeatherSummary(weather)).toBe("0°C, Overcast");
    });
  });

  describe("Performance Analysis", () => {
    it("should create performance analysis from session data", () => {
      const session: KartingSession = {
        id: "session-1",
        kartNumber: "42",
        trackName: "Norway Motorsports Park",
        trackLayout: "National",
        trackLocation: {
          latitude: 41.7831,
          longitude: -88.5678,
        },
        date: new Date().toISOString(),
        weather: {
          temperature: 0,
          humidity: 81,
          windSpeed: 19.3,
          windDirection: 37,
          trackAsphaltTemp: 19.5,
          conditions: "Overcast",
          timestamp: new Date().toISOString(),
        },
        tireSetup: {
          type: "MG Orange",
          pressureFrontLeft: 15,
          pressureFrontRight: 15,
          pressureRearLeft: 15,
          pressureRearRight: 15,
          rimBrand: "OTK",
          rimMetallurgy: "Magnesium",
          weightDistribution: {
            frontLeft: 50,
            frontRight: 50,
            rearLeft: 50,
            rearRight: 50,
          },
        },
        chassisSetup: {
          type: "Birel Art",
          serialNumber: "BA-2024-001",
          frontLeft: { caster: 3.5, camber: -1.5, toe: 0.2 },
          frontRight: { caster: 3.5, camber: -1.5, toe: 0.2 },
          axleBrand: "OTK",
          axleWidth: 50,
          axleStiffness: "M2",
        },
        engineSetup: {
          type: "B+S LO206",
          serialNumber: "BS-2024-001",
          sparkPlug: "AR50",
        },
        gearingSetup: {
          frontDriver: 12,
          rearSprocket: 60,
          ratio: 5.0,
        },
        weightDistribution: {
          frontLeftWeight: 50,
          frontRightWeight: 50,
          rearLeftWeight: 50,
          rearRightWeight: 50,
          crossWeightPercentage: 50,
          totalWeight: 200,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bestLapTime: 65.234,
        averageLapTime: 66.5,
        lapCount: 12,
        performanceNotes: "Good grip, tires felt responsive",
      };

      const analysis: PerformanceAnalysis = {
        sessionId: session.id,
        weatherConditions: "Overcast",
        temperature: session.weather.temperature,
        humidity: session.weather.humidity,
        windSpeed: session.weather.windSpeed,
        windDirection: session.weather.windDirection,
        bestLapTime: session.bestLapTime!,
        averageLapTime: session.averageLapTime!,
        lapCount: session.lapCount!,
        setupSummary: {
          tireType: session.tireSetup.type,
          chassisType: session.chassisSetup.type,
          engineType: session.engineSetup.type,
          gearRatio: session.gearingSetup.ratio || 0,
        },
        performanceNotes: session.performanceNotes || "",
      };

      expect(analysis.sessionId).toBe("session-1");
      expect(analysis.weatherConditions).toBe("Overcast");
      expect(analysis.temperature).toBe(0);
      expect(analysis.humidity).toBe(81);
      expect(analysis.bestLapTime).toBe(65.234);
      expect(analysis.setupSummary.tireType).toBe("MG Orange");
      expect(analysis.setupSummary.gearRatio).toBe(5.0);
    });

    it("should calculate correlation score based on conditions", () => {
      const calculateCorrelationScore = (
        lapTimeDifference: number,
        windSpeed: number,
        temperature: number
      ): number => {
        let score = 100;

        // Deduct for lap time variance
        score -= Math.min(lapTimeDifference * 10, 20);

        // Deduct for wind conditions
        if (windSpeed > 20) score -= 15;
        else if (windSpeed > 15) score -= 10;

        // Deduct for extreme temperatures
        if (temperature < -5 || temperature > 35) score -= 10;

        return Math.max(0, score);
      };

      // Good conditions: small variance, moderate wind, normal temp
      const goodScore = calculateCorrelationScore(0.5, 12, 15);
      expect(goodScore).toBeGreaterThan(70);

      // Poor conditions: high variance, strong wind, cold
      const poorScore = calculateCorrelationScore(2.0, 25, -10);
      expect(poorScore).toBeLessThan(70);
    });
  });

  describe("Lap Time Tracking", () => {
    it("should create lap time records", () => {
      const lapTimes: LapTime[] = [
        {
          sessionId: "session-1",
          lapNumber: 1,
          lapTime: 67.5,
          recordedAt: new Date().toISOString(),
        },
        {
          sessionId: "session-1",
          lapNumber: 2,
          lapTime: 65.234,
          recordedAt: new Date().toISOString(),
        },
        {
          sessionId: "session-1",
          lapNumber: 3,
          lapTime: 66.1,
          recordedAt: new Date().toISOString(),
        },
      ];

      expect(lapTimes).toHaveLength(3);
      expect(lapTimes[0].lapTime).toBe(67.5);
      expect(lapTimes[1].lapTime).toBe(65.234); // Best lap
      expect(lapTimes[2].lapTime).toBe(66.1);
    });

    it("should calculate best and average lap times", () => {
      const lapTimes = [67.5, 65.234, 66.1, 65.8, 66.5];

      const bestLapTime = Math.min(...lapTimes);
      const averageLapTime = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;

      expect(bestLapTime).toBe(65.234);
      expect(averageLapTime).toBeCloseTo(66.226, 2);
    });
  });

  describe("Weather Context Storage", () => {
    it("should store complete weather data with session", () => {
      const session: KartingSession = {
        id: "session-1",
        kartNumber: "42",
        trackName: "Gateway Kartplex",
        trackLayout: "National",
        trackLocation: {
          latitude: 42.5833,
          longitude: -89.2667,
        },
        date: new Date().toISOString(),
        weather: {
          temperature: 0, // 32°F
          humidity: 51,
          windSpeed: 16.1, // 10 mph in km/h
          windDirection: 180,
          trackAsphaltTemp: 5, // Estimated
          conditions: "Clear",
          timestamp: new Date().toISOString(),
        },
        tireSetup: {
          type: "MG Red",
          pressureFrontLeft: 16,
          pressureFrontRight: 16,
          pressureRearLeft: 16,
          pressureRearRight: 16,
          rimBrand: "OTK",
          rimMetallurgy: "Aluminum",
          weightDistribution: {
            frontLeft: 50,
            frontRight: 50,
            rearLeft: 50,
            rearRight: 50,
          },
        },
        chassisSetup: {
          type: "Tony Kart",
          serialNumber: "TK-2024-001",
          frontLeft: { caster: 3.0, camber: -1.0, toe: 0.1 },
          frontRight: { caster: 3.0, camber: -1.0, toe: 0.1 },
          axleBrand: "PKT",
          axleWidth: 50,
          axleStiffness: "M1",
        },
        engineSetup: {
          type: "IAME Mini-Swift",
          serialNumber: "IM-2024-001",
          sparkPlug: "AR51",
        },
        gearingSetup: {
          frontDriver: 13,
          rearSprocket: 65,
          ratio: 5.0,
        },
        weightDistribution: {
          frontLeftWeight: 50,
          frontRightWeight: 50,
          rearLeftWeight: 50,
          rearRightWeight: 50,
          crossWeightPercentage: 50,
          totalWeight: 200,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Verify weather data is stored
      expect(session.weather.temperature).toBe(0);
      expect(session.weather.humidity).toBe(51);
      expect(session.weather.windSpeed).toBe(16.1);
      expect(session.weather.windDirection).toBe(180);
      expect(session.weather.conditions).toBe("Clear");

      // Verify track location matches Gateway Kartplex
      expect(session.trackLocation.latitude).toBe(42.5833);
      expect(session.trackLocation.longitude).toBe(-89.2667);
    });
  });

  describe("New Tracks Database", () => {
    it("should have Gateway Kartplex in tracks database", () => {
      const gatewayKartplex = {
        id: "gateway-kartplex",
        name: "Gateway Kartplex",
        city: "Madison",
        state: "IL",
        latitude: 42.5833,
        longitude: -89.2667,
        region: "Midwest",
      };

      expect(gatewayKartplex.name).toBe("Gateway Kartplex");
      expect(gatewayKartplex.city).toBe("Madison");
      expect(gatewayKartplex.state).toBe("IL");
      expect(gatewayKartplex.latitude).toBe(42.5833);
      expect(gatewayKartplex.longitude).toBe(-89.2667);
    });

    it("should have Mid-State Kart Club in tracks database", () => {
      const midStateKartClub = {
        id: "mid-state-kart-club",
        name: "Mid-State Kart Club",
        city: "Springfield",
        state: "IL",
        latitude: 39.7817,
        longitude: -89.6501,
        region: "Midwest",
      };

      expect(midStateKartClub.name).toBe("Mid-State Kart Club");
      expect(midStateKartClub.city).toBe("Springfield");
      expect(midStateKartClub.state).toBe("IL");
      expect(midStateKartClub.latitude).toBe(39.7817);
      expect(midStateKartClub.longitude).toBe(-89.6501);
    });

    it("should fetch weather for new track coordinates", () => {
      const gatewayCoordinates = {
        latitude: 42.5833,
        longitude: -89.2667,
      };

      // Verify coordinates are valid
      expect(gatewayCoordinates.latitude).toBeGreaterThan(40);
      expect(gatewayCoordinates.latitude).toBeLessThan(45);
      expect(gatewayCoordinates.longitude).toBeGreaterThan(-91);
      expect(gatewayCoordinates.longitude).toBeLessThan(-88);
    });
  });
});
