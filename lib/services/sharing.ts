import type { KartingSession } from "@/lib/types";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

export interface ShareableSetup {
  version: "1.0";
  exportedAt: string;
  exportedBy?: string;
  setup: KartingSession;
  metadata: {
    appVersion: "1.0.0";
    appName: "FDR Kart Setup Data";
  };
}

/**
 * Generate a shareable setup object from a session
 */
export function generateShareableSetup(
  session: KartingSession,
  exportedBy?: string
): ShareableSetup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    exportedBy,
    setup: session,
    metadata: {
      appVersion: "1.0.0",
      appName: "FDR Kart Setup Data",
    },
  };
}

/**
 * Generate a unique share code for a setup
 * Format: TRACK-YYYY-XXXX (e.g., DAYT-2026-A7K2)
 */
export function generateShareCode(session: KartingSession): string {
  const trackPrefix = session.trackName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, "");
  const year = new Date(session.date).getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${trackPrefix}-${year}-${randomPart}`;
}

/**
 * Export setup as JSON file and share via system share sheet
 */
export async function shareSetupViaFile(session: KartingSession): Promise<void> {
  try {
    const shareableSetup = generateShareableSetup(session);
    const fileName = `FDR_Setup_${session.id}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write JSON to file
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(shareableSetup, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Share Kart Setup",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Failed to share setup:", error);
    throw error;
  }
}

/**
 * Generate a formatted text summary of a setup for sharing
 */
export function generateSetupSummary(session: KartingSession): string {
  const lines = [
    `🏎️ FDR Kart Setup Data - Setup Summary`,
    ``,
    `Track: ${session.trackName}`,
    `Date: ${new Date(session.date).toLocaleDateString()}`,
    ``,
    `⛅ Weather:`,
    `  Temperature: ${session.weather.temperature.toFixed(1)}°`,
    `  Conditions: ${session.weather.conditions}`,
    `  Humidity: ${session.weather.humidity}%`,
    `  Wind Speed: ${session.weather.windSpeed.toFixed(1)} km/h`,
    ``,
    `🛞 Tires:`,
    `  Type: ${session.tireSetup.type}`,
    `  FL Pressure: ${session.tireSetup.pressureFrontLeft} PSI`,
    `  FR Pressure: ${session.tireSetup.pressureFrontRight} PSI`,
    `  RL Pressure: ${session.tireSetup.pressureRearLeft} PSI`,
    `  RR Pressure: ${session.tireSetup.pressureRearRight} PSI`,
    `  Rim Brand: ${session.tireSetup.rimBrand}`,
    ``,
    `🏎️ Chassis:`,
    `  Type: ${session.chassisSetup.type}`,
    `  Front Left - Caster: ${session.chassisSetup.frontLeft.caster}°, Camber: ${session.chassisSetup.frontLeft.camber}°, Toe: ${session.chassisSetup.frontLeft.toe}°`,
    `  Front Right - Caster: ${session.chassisSetup.frontRight.caster}°, Camber: ${session.chassisSetup.frontRight.camber}°, Toe: ${session.chassisSetup.frontRight.toe}°`,
    `  Axle: ${session.chassisSetup.axleBrand} - Stiffness: ${session.chassisSetup.axleStiffness}`,
    ``,
    `⚡️ Engine:`,
    `  Type: ${session.engineSetup.type}`,
    `  Serial: ${session.engineSetup.serialNumber}`,
    `  Spark Plug: ${session.engineSetup.sparkPlug || "Not set"}`,
    `  Last Spark Plug Change: ${session.engineSetup.lastSparkPlugChangeDate || "Not recorded"}`,
    `  Last Oil Change: ${session.engineSetup.lastOilChangeDate || "Not recorded"}`,
    ``,
    `⚖️ Weight Distribution:`,
    `  Total: ${session.weightDistribution.totalWeight}kg`,
    `  Cross Weight: ${session.weightDistribution.crossWeightPercentage.toFixed(1)}%`,
    `  FL: ${session.weightDistribution.frontLeftWeight}kg`,
    `  FR: ${session.weightDistribution.frontRightWeight}kg`,
    `  RL: ${session.weightDistribution.rearLeftWeight}kg`,
    `  RR: ${session.weightDistribution.rearRightWeight}kg`,
    ``,
    `Shared from FDR Kart Setup Data`,
  ];

  return lines.join("\n");
}

/**
 * Parse a shareable setup JSON string
 */
export function parseShareableSetup(jsonString: string): ShareableSetup {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!parsed.version || !parsed.setup || !parsed.metadata) {
      throw new Error("Invalid shareable setup format");
    }

    return parsed as ShareableSetup;
  } catch (error) {
    console.error("Failed to parse shareable setup:", error);
    throw new Error("Invalid setup data format");
  }
}

/**
 * Validate if a setup is compatible with current app version
 */
export function isSetupCompatible(setup: ShareableSetup): boolean {
  // Check version compatibility
  const [major] = setup.version.split(".").map(Number);
  return major === 1;
}

/**
 * Generate a QR code data URL for a setup
 * Note: This returns the JSON data encoded for QR code generation
 */
export function generateQRCodeData(session: KartingSession): string {
  const shareableSetup = generateShareableSetup(session);
  // Compress to make QR code smaller
  return JSON.stringify(shareableSetup);
}

/**
 * Create a shareable link format (for future cloud integration)
 */
export function generateShareLink(shareCode: string): string {
  return `fdr-kart://setup/${shareCode}`;
}
