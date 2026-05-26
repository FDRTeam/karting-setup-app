/**
 * Analytics utilities for data aggregation, filtering, and calculations
 */

export interface AnalyticsMetrics {
  totalSetups: number;
  totalUsers: number;
  activeUsers: number;
  averageSetupsPerUser: number;
  mostPopularTrack: string | null;
  mostUsedKart: string | null;
  setupsThisMonth: number;
  setupsThisWeek: number;
}

export interface TrackStats {
  track: string;
  count: number;
  percentage: number;
}

export interface UserStats {
  userId: number;
  userName: string;
  setupCount: number;
  percentage: number;
  lastActive: Date | null;
}

export interface KartStats {
  kart: string;
  count: number;
  percentage: number;
}

export interface TrendPoint {
  date: string;
  count: number;
  cumulativeCount: number;
}

/**
 * Calculate percentage of a value relative to total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format track statistics with percentages
 */
export function formatTrackStats(
  trackData: Array<{ track: string; count: number }>
): TrackStats[] {
  const total = trackData.reduce((sum, t) => sum + t.count, 0);
  return trackData.map((t) => ({
    ...t,
    percentage: calculatePercentage(t.count, total),
  }));
}

/**
 * Format kart statistics with percentages
 */
export function formatKartStats(
  kartData: Array<{ kart: string; count: number }>
): KartStats[] {
  const total = kartData.reduce((sum, k) => sum + k.count, 0);
  return kartData.map((k) => ({
    ...k,
    percentage: calculatePercentage(k.count, total),
  }));
}

/**
 * Format user statistics with percentages
 */
export function formatUserStats(
  userData: Array<{ userId: number; userName: string; setupCount: number }>
): UserStats[] {
  const total = userData.reduce((sum, u) => sum + u.setupCount, 0);
  return userData.map((u) => ({
    ...u,
    percentage: calculatePercentage(u.setupCount, total),
    lastActive: null,
  }));
}

/**
 * Calculate cumulative trend data for line charts
 */
export function calculateCumulativeTrends(
  trendData: Array<{ date: string; count: number }>
): TrendPoint[] {
  let cumulative = 0;
  return trendData.map((t) => {
    cumulative += t.count;
    return {
      ...t,
      cumulativeCount: cumulative,
    };
  });
}

/**
 * Filter trend data by date range
 */
export function filterTrendsByDateRange(
  trendData: Array<{ date: string; count: number }>,
  startDate: Date,
  endDate: Date
): Array<{ date: string; count: number }> {
  return trendData.filter((t) => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Get top N items from a sorted array
 */
export function getTopItems<T extends { count?: number; setupCount?: number }>(
  items: T[],
  limit: number = 10
): T[] {
  return items
    .sort((a, b) => {
      const countA = a.count || a.setupCount || 0;
      const countB = b.count || b.setupCount || 0;
      return countB - countA;
    })
    .slice(0, limit);
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Group data by time period (day, week, month)
 */
export function groupByTimePeriod(
  data: Array<{ date: string; count: number }>,
  period: "day" | "week" | "month"
): Record<string, number> {
  const grouped: Record<string, number> = {};

  data.forEach(({ date, count }) => {
    const d = new Date(date);
    let key = "";

    if (period === "day") {
      key = date;
    } else if (period === "week") {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else if (period === "month") {
      key = date.substring(0, 7);
    }

    grouped[key] = (grouped[key] || 0) + count;
  });

  return grouped;
}

/**
 * Calculate average value from array
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

/**
 * Find peak activity (highest count)
 */
export function findPeakActivity(
  data: Array<{ date: string; count: number }>
): { date: string; count: number } | null {
  if (data.length === 0) return null;
  return data.reduce((max, current) =>
    current.count > max.count ? current : max
  );
}

/**
 * Find lowest activity
 */
export function findLowestActivity(
  data: Array<{ date: string; count: number }>
): { date: string; count: number } | null {
  if (data.length === 0) return null;
  return data.reduce((min, current) =>
    current.count < min.count ? current : min
  );
}

/**
 * Generate summary statistics from analytics data
 */
export function generateSummaryStats(
  totalSetups: number,
  totalUsers: number,
  activeUsers: number,
  trendData: Array<{ date: string; count: number }>
): AnalyticsMetrics {
  const thisWeekData = trendData.slice(-7);
  const thisMonthData = trendData.slice(-30);

  return {
    totalSetups,
    totalUsers,
    activeUsers,
    averageSetupsPerUser: activeUsers > 0 ? totalSetups / activeUsers : 0,
    mostPopularTrack: null,
    mostUsedKart: null,
    setupsThisMonth: thisMonthData.reduce((sum, t) => sum + t.count, 0),
    setupsThisWeek: thisWeekData.reduce((sum, t) => sum + t.count, 0),
  };
}
