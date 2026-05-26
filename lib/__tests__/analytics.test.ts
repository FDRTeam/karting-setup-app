import { describe, it, expect } from "vitest";
import {
  calculatePercentage,
  formatTrackStats,
  formatKartStats,
  formatUserStats,
  calculateCumulativeTrends,
  filterTrendsByDateRange,
  getTopItems,
  calculateGrowthRate,
  groupByTimePeriod,
  calculateAverage,
  findPeakActivity,
  findLowestActivity,
  generateSummaryStats,
} from "../utils/analytics";

describe("Analytics Utilities", () => {
  describe("calculatePercentage", () => {
    it("should calculate percentage correctly", () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    it("should handle zero total", () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });

  describe("formatTrackStats", () => {
    it("should format track stats with percentages", () => {
      const trackData = [
        { track: "Autobahn", count: 50 },
        { track: "National", count: 30 },
        { track: "Local", count: 20 },
      ];

      const result = formatTrackStats(trackData);

      expect(result).toHaveLength(3);
      expect(result[0].percentage).toBe(50);
      expect(result[1].percentage).toBe(30);
      expect(result[2].percentage).toBe(20);
    });
  });

  describe("formatKartStats", () => {
    it("should format kart stats with percentages", () => {
      const kartData = [
        { kart: "K-1", count: 60 },
        { kart: "K-2", count: 40 },
      ];

      const result = formatKartStats(kartData);

      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(60);
      expect(result[1].percentage).toBe(40);
    });
  });

  describe("formatUserStats", () => {
    it("should format user stats with percentages", () => {
      const userData = [
        { userId: 1, userName: "Alice", setupCount: 50 },
        { userId: 2, userName: "Bob", setupCount: 50 },
      ];

      const result = formatUserStats(userData);

      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(50);
      expect(result[1].percentage).toBe(50);
      expect(result[0].lastActive).toBeNull();
    });
  });

  describe("calculateCumulativeTrends", () => {
    it("should calculate cumulative counts", () => {
      const trendData = [
        { date: "2026-01-01", count: 10 },
        { date: "2026-01-02", count: 20 },
        { date: "2026-01-03", count: 30 },
      ];

      const result = calculateCumulativeTrends(trendData);

      expect(result[0].cumulativeCount).toBe(10);
      expect(result[1].cumulativeCount).toBe(30);
      expect(result[2].cumulativeCount).toBe(60);
    });
  });

  describe("filterTrendsByDateRange", () => {
    it("should filter trends by date range", () => {
      const trendData = [
        { date: "2026-01-01", count: 10 },
        { date: "2026-01-05", count: 20 },
        { date: "2026-01-10", count: 30 },
      ];

      const startDate = new Date("2026-01-05");
      const endDate = new Date("2026-01-10");

      const result = filterTrendsByDateRange(trendData, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2026-01-05");
    });
  });

  describe("getTopItems", () => {
    it("should return top items sorted by count", () => {
      const items = [
        { track: "A", count: 10 },
        { track: "B", count: 50 },
        { track: "C", count: 30 },
      ];

      const result = getTopItems(items, 2);

      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(50);
      expect(result[1].count).toBe(30);
    });

    it("should handle setupCount property", () => {
      const items = [
        { userId: 1, setupCount: 10 },
        { userId: 2, setupCount: 50 },
      ];

      const result = getTopItems(items, 1);

      expect(result).toHaveLength(1);
      expect(result[0].setupCount).toBe(50);
    });
  });

  describe("calculateGrowthRate", () => {
    it("should calculate growth rate correctly", () => {
      expect(calculateGrowthRate(150, 100)).toBe(50);
      expect(calculateGrowthRate(100, 100)).toBe(0);
      expect(calculateGrowthRate(50, 100)).toBe(-50);
    });

    it("should handle zero previous value", () => {
      expect(calculateGrowthRate(100, 0)).toBe(100);
      expect(calculateGrowthRate(0, 0)).toBe(0);
    });
  });

  describe("groupByTimePeriod", () => {
    it("should group by day", () => {
      const data = [
        { date: "2026-01-01", count: 10 },
        { date: "2026-01-01", count: 20 },
        { date: "2026-01-02", count: 30 },
      ];

      const result = groupByTimePeriod(data, "day");

      expect(result["2026-01-01"]).toBe(30);
      expect(result["2026-01-02"]).toBe(30);
    });

    it("should group by month", () => {
      const data = [
        { date: "2026-01-01", count: 10 },
        { date: "2026-01-15", count: 20 },
        { date: "2026-02-01", count: 30 },
      ];

      const result = groupByTimePeriod(data, "month");

      expect(result["2026-01"]).toBe(30);
      expect(result["2026-02"]).toBe(30);
    });
  });

  describe("calculateAverage", () => {
    it("should calculate average correctly", () => {
      expect(calculateAverage([10, 20, 30])).toBe(20);
      expect(calculateAverage([100])).toBe(100);
      expect(calculateAverage([])).toBe(0);
    });
  });

  describe("findPeakActivity", () => {
    it("should find peak activity", () => {
      const data = [
        { date: "2026-01-01", count: 10 },
        { date: "2026-01-02", count: 50 },
        { date: "2026-01-03", count: 30 },
      ];

      const result = findPeakActivity(data);

      expect(result?.date).toBe("2026-01-02");
      expect(result?.count).toBe(50);
    });

    it("should return null for empty data", () => {
      expect(findPeakActivity([])).toBeNull();
    });
  });

  describe("findLowestActivity", () => {
    it("should find lowest activity", () => {
      const data = [
        { date: "2026-01-01", count: 50 },
        { date: "2026-01-02", count: 10 },
        { date: "2026-01-03", count: 30 },
      ];

      const result = findLowestActivity(data);

      expect(result?.date).toBe("2026-01-02");
      expect(result?.count).toBe(10);
    });

    it("should return null for empty data", () => {
      expect(findLowestActivity([])).toBeNull();
    });
  });

  describe("generateSummaryStats", () => {
    it("should generate summary statistics", () => {
      const trendData = [
        { date: "2026-01-01", count: 5 },
        { date: "2026-01-02", count: 10 },
        { date: "2026-01-03", count: 15 },
      ];

      const result = generateSummaryStats(30, 10, 8, trendData);

      expect(result.totalSetups).toBe(30);
      expect(result.totalUsers).toBe(10);
      expect(result.activeUsers).toBe(8);
      expect(result.averageSetupsPerUser).toBe(3.75);
    });

    it("should calculate weekly and monthly setups", () => {
      const trendData = Array.from({ length: 30 }, (_, i) => ({
        date: `2026-01-${String(i + 1).padStart(2, "0")}`,
        count: 1,
      }));

      const result = generateSummaryStats(30, 10, 8, trendData);

      expect(result.setupsThisMonth).toBe(30);
      expect(result.setupsThisWeek).toBe(7);
    });
  });
});
