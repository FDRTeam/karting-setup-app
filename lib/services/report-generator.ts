/**
 * Report generation service for creating PDF exports of analytics data
 */

export interface ReportData {
  title: string;
  generatedAt: string;
  metrics: {
    totalSetups: number;
    totalUsers: number;
    activeUsers: number;
    averageSetupsPerUser: number;
  };
  setupsByTrack: Array<{ track: string; count: number; percentage: number }>;
  setupsByKart: Array<{ kart: string; count: number; percentage: number }>;
  topUsers: Array<{ userId: number; userName: string; setupCount: number; percentage: number }>;
  trends: Array<{ date: string; count: number }>;
}

export class ReportGenerator {
  /**
   * Generate a text-based report (can be converted to PDF later)
   */
  static generateTextReport(data: ReportData): string {
    const lines: string[] = [];

    // Header
    lines.push("=".repeat(80));
    lines.push(data.title);
    lines.push("=".repeat(80));
    lines.push(`Generated: ${data.generatedAt}`);
    lines.push("");

    // Key Metrics Section
    lines.push("KEY METRICS");
    lines.push("-".repeat(80));
    lines.push(`Total Setups:              ${data.metrics.totalSetups}`);
    lines.push(`Total Users:               ${data.metrics.totalUsers}`);
    lines.push(`Active Users:              ${data.metrics.activeUsers}`);
    lines.push(`Avg Setups per User:       ${data.metrics.averageSetupsPerUser.toFixed(2)}`);
    lines.push("");

    // Setups by Track Section
    if (data.setupsByTrack.length > 0) {
      lines.push("SETUPS BY TRACK");
      lines.push("-".repeat(80));
      data.setupsByTrack.forEach((track) => {
        const bar = this.generateBar(track.percentage);
        lines.push(`${track.track.padEnd(30)} ${track.count.toString().padStart(4)} [${bar}] ${track.percentage}%`);
      });
      lines.push("");
    }

    // Setups by Kart Section
    if (data.setupsByKart.length > 0) {
      lines.push("SETUPS BY KART");
      lines.push("-".repeat(80));
      data.setupsByKart.forEach((kart) => {
        const bar = this.generateBar(kart.percentage);
        lines.push(`${kart.kart.padEnd(30)} ${kart.count.toString().padStart(4)} [${bar}] ${kart.percentage}%`);
      });
      lines.push("");
    }

    // Top Users Section
    if (data.topUsers.length > 0) {
      lines.push("TOP USERS");
      lines.push("-".repeat(80));
      data.topUsers.forEach((user, idx) => {
        lines.push(`${(idx + 1).toString().padStart(2)}. ${user.userName.padEnd(30)} ${user.setupCount.toString().padStart(4)} setups (${user.percentage}%)`);
      });
      lines.push("");
    }

    // Trends Section
    if (data.trends.length > 0) {
      lines.push("SETUP TRENDS (LAST 30 DAYS)");
      lines.push("-".repeat(80));
      const maxCount = Math.max(...data.trends.map((t) => t.count), 1);
      data.trends.slice(-7).forEach((trend) => {
        const bar = this.generateBar((trend.count / maxCount) * 100);
        lines.push(`${trend.date} [${bar}] ${trend.count} setups`);
      });
      lines.push("");
    }

    // Footer
    lines.push("=".repeat(80));
    lines.push("End of Report");
    lines.push("=".repeat(80));

    return lines.join("\n");
  }

  /**
   * Generate CSV format report
   */
  static generateCSVReport(data: ReportData): string {
    const lines: string[] = [];

    // Metrics section
    lines.push("KARTING SETUP ANALYTICS REPORT");
    lines.push(`Generated,${data.generatedAt}`);
    lines.push("");

    lines.push("KEY METRICS");
    lines.push("Metric,Value");
    lines.push(`Total Setups,${data.metrics.totalSetups}`);
    lines.push(`Total Users,${data.metrics.totalUsers}`);
    lines.push(`Active Users,${data.metrics.activeUsers}`);
    lines.push(`Average Setups per User,${data.metrics.averageSetupsPerUser.toFixed(2)}`);
    lines.push("");

    // Setups by track
    if (data.setupsByTrack.length > 0) {
      lines.push("SETUPS BY TRACK");
      lines.push("Track,Count,Percentage");
      data.setupsByTrack.forEach((track) => {
        lines.push(`${track.track},${track.count},${track.percentage}%`);
      });
      lines.push("");
    }

    // Setups by kart
    if (data.setupsByKart.length > 0) {
      lines.push("SETUPS BY KART");
      lines.push("Kart,Count,Percentage");
      data.setupsByKart.forEach((kart) => {
        lines.push(`${kart.kart},${kart.count},${kart.percentage}%`);
      });
      lines.push("");
    }

    // Top users
    if (data.topUsers.length > 0) {
      lines.push("TOP USERS");
      lines.push("Rank,User Name,Setup Count,Percentage");
      data.topUsers.forEach((user, idx) => {
        lines.push(`${idx + 1},${user.userName},${user.setupCount},${user.percentage}%`);
      });
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Generate JSON format report
   */
  static generateJSONReport(data: ReportData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Helper to generate a text-based bar for ASCII reports
   */
  private static generateBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  /**
   * Export report to file (returns base64 encoded content)
   */
  static exportAsBase64(content: string, format: "text" | "csv" | "json"): string {
    const mimeTypes = {
      text: "text/plain",
      csv: "text/csv",
      json: "application/json",
    };

    if (typeof window !== "undefined" && window.btoa) {
      return window.btoa(unescape(encodeURIComponent(content)));
    }

    // Node.js fallback
    return Buffer.from(content).toString("base64");
  }

  /**
   * Create downloadable file URL
   */
  static createDownloadUrl(content: string, filename: string, format: "text" | "csv" | "json"): string {
    const mimeTypes = {
      text: "text/plain",
      csv: "text/csv",
      json: "application/json",
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    return URL.createObjectURL(blob);
  }
}
