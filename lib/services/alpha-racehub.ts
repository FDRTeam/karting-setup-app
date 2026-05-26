import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Alpha Racehub Integration Service
 * 
 * Since Alpha Racehub does not provide a public API, this service handles:
 * 1. CSV import from Alpha Racehub exports
 * 2. Manual event creation and lap time entry
 * 3. Data parsing and validation
 * 4. Export/sharing of lap data
 * 
 * Alpha Racehub: https://apps.apple.com/us/app/alpha-racehub/id1641105709
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AlphaRacehubEvent {
  id: string;
  name: string;
  date: string; // ISO date string
  location: string;
  trackLayout?: string;
  eventType: 'race' | 'practice' | 'qualifying';
  source: 'csv_import' | 'manual';
  importedAt: string; // ISO date string
}

export interface AlphaRacehubParticipant {
  id: string;
  name: string;
  number: string;
  class?: string;
  team?: string;
  bestLapTime?: number; // milliseconds
  totalLaps?: number;
  position?: number;
}

export interface AlphaRacehubLapTime {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  participantNumber: string;
  lapNumber: number;
  lapTime: number; // milliseconds
  position?: number;
  gap?: number; // milliseconds
  isValid: boolean;
  timestamp: string; // ISO date string
  notes?: string;
}

export interface CSVParseResult {
  success: boolean;
  event?: AlphaRacehubEvent;
  lapTimes?: AlphaRacehubLapTime[];
  participants?: AlphaRacehubParticipant[];
  errors: string[];
  warnings: string[];
}

export interface CSVRow {
  [key: string]: string;
}

// ============================================================================
// CSV Import Service
// ============================================================================

export class AlphaRacehubCSVImporter {
  /**
   * Pick a CSV file from device storage
   */
  static async pickCSVFile(): Promise<string> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      });

      if (result.canceled) {
        throw new Error('File selection was canceled');
      }

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error('No file URI returned');
      }

      return file.uri;
    } catch (error) {
      console.error('Failed to pick CSV file:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to pick CSV file'
      );
    }
  }

  /**
   * Read CSV file content
   */
  static async readCSVFile(uri: string): Promise<string> {
    try {
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return content;
    } catch (error) {
      console.error('Failed to read CSV file:', error);
      throw new Error('Failed to read CSV file');
    }
  }

  /**
   * Parse CSV content into rows
   * Handles standard CSV format with comma or semicolon delimiters
   */
  static parseCSVContent(content: string): CSVRow[] {
    const lines = content.split('\n').map((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Detect delimiter (comma or semicolon)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';

    // Parse header
    const headers = this.parseCSVLine(headerLine, delimiter);
    if (headers.length === 0) {
      throw new Error('CSV header is empty');
    }

    // Parse data rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue; // Skip empty lines

      const values = this.parseCSVLine(line, delimiter);
      if (values.length === 0) continue;

      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase().trim()] = values[index]?.trim() || '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse a single CSV line, handling quoted values
   */
  private static parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Parse lap time string to milliseconds
   * Supports formats: MM:SS.mmm, MM:SS, SS.mmm, HH:MM:SS
   */
  static parseLapTimeString(timeStr: string): number {
    const cleaned = timeStr.trim();
    const parts = cleaned.split(':');

    if (parts.length === 1) {
      // Format: SS.mmm or just SS
      const seconds = parseFloat(parts[0]);
      return Math.round(seconds * 1000);
    } else if (parts.length === 2) {
      // Format: MM:SS.mmm
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return Math.round((minutes * 60 + seconds) * 1000);
    } else if (parts.length === 3) {
      // Format: HH:MM:SS
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseFloat(parts[2]);
      return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
    }

    throw new Error(`Invalid time format: ${timeStr}`);
  }

  /**
   * Format milliseconds to MM:SS.mmm
   */
  static formatLapTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }

  /**
   * Detect CSV format and extract event metadata
   */
  static detectEventMetadata(rows: CSVRow[]): {
    eventName?: string;
    eventDate?: string;
    location?: string;
  } {
    const metadata: {
      eventName?: string;
      eventDate?: string;
      location?: string;
    } = {};

    if (rows.length === 0) return metadata;

    // Look for common metadata fields in first row
    const firstRow = rows[0];

    // Try to find event name
    if (firstRow['event'] || firstRow['event name']) {
      metadata.eventName = firstRow['event'] || firstRow['event name'];
    }

    // Try to find date
    if (firstRow['date'] || firstRow['event date']) {
      metadata.eventDate = firstRow['date'] || firstRow['event date'];
    }

    // Try to find location
    if (firstRow['location'] || firstRow['track'] || firstRow['venue']) {
      metadata.location =
        firstRow['location'] || firstRow['track'] || firstRow['venue'];
    }

    return metadata;
  }

  /**
   * Parse Alpha Racehub CSV export
   * Expected columns: Lap, Time, Position, Gap, Notes (or similar variations)
   */
  static parseAlphaRacehubCSV(
    rows: CSVRow[],
    eventId: string,
    participantId: string,
    participantName: string
  ): AlphaRacehubLapTime[] {
    const lapTimes: AlphaRacehubLapTime[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        // Find lap number (try various column names)
        const lapNumberStr =
          row['lap'] ||
          row['lap #'] ||
          row['lap number'] ||
          row['#'] ||
          String(index + 1);
        const lapNumber = parseInt(lapNumberStr);

        if (isNaN(lapNumber)) {
          errors.push(`Row ${index + 1}: Invalid lap number "${lapNumberStr}"`);
          return;
        }

        // Find lap time (try various column names)
        const timeStr =
          row['time'] ||
          row['lap time'] ||
          row['laptime'] ||
          row['duration'];

        if (!timeStr) {
          errors.push(`Row ${index + 1}: Missing lap time`);
          return;
        }

        const lapTime = this.parseLapTimeString(timeStr);

        // Optional fields
        const position = row['position'] || row['pos'] ? parseInt(row['position'] || row['pos']) : undefined;
        const gapStr = row['gap'] || row['delta'];
        const gap = gapStr ? this.parseLapTimeString(gapStr) : undefined;
        const notes = row['notes'] || row['comment'] || undefined;

        lapTimes.push({
          id: `${eventId}-${participantId}-${lapNumber}-${Date.now()}`,
          eventId,
          participantId,
          participantName,
          participantNumber: '',
          lapNumber,
          lapTime,
          position,
          gap,
          isValid: true,
          timestamp: new Date().toISOString(),
          notes,
        });
      } catch (error) {
        errors.push(
          `Row ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`
        );
      }
    });

    return lapTimes;
  }

  /**
   * Import CSV file and parse lap times
   */
  static async importFromCSV(
    eventId: string,
    participantId: string,
    participantName: string
  ): Promise<CSVParseResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Pick file
      const fileUri = await this.pickCSVFile();

      // Read file
      const content = await this.readCSVFile(fileUri);

      // Parse CSV
      const rows = this.parseCSVContent(content);

      // Detect metadata
      const metadata = this.detectEventMetadata(rows);

      // Parse lap times
      const lapTimes = this.parseAlphaRacehubCSV(
        rows,
        eventId,
        participantId,
        participantName
      );

      if (lapTimes.length === 0) {
        errors.push('No valid lap times found in CSV');
        return { success: false, errors, warnings };
      }

      // Create event object
      const event: AlphaRacehubEvent = {
        id: eventId,
        name: metadata.eventName || 'Imported Event',
        date: metadata.eventDate || new Date().toISOString(),
        location: metadata.location || 'Unknown',
        eventType: 'race',
        source: 'csv_import',
        importedAt: new Date().toISOString(),
      };

      return {
        success: true,
        event,
        lapTimes,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, errors, warnings };
    }
  }
}

// ============================================================================
// Manual Event Creator
// ============================================================================

export class AlphaRacehubEventCreator {
  /**
   * Create a manual event (for users without CSV export)
   */
  static createManualEvent(
    name: string,
    date: string,
    location: string,
    trackLayout?: string
  ): AlphaRacehubEvent {
    return {
      id: `manual-${Date.now()}`,
      name,
      date,
      location,
      trackLayout,
      eventType: 'race',
      source: 'manual',
      importedAt: new Date().toISOString(),
    };
  }

  /**
   * Add a manual lap time entry
   */
  static createManualLapTime(
    eventId: string,
    participantId: string,
    participantName: string,
    lapNumber: number,
    lapTimeMs: number,
    notes?: string
  ): AlphaRacehubLapTime {
    return {
      id: `${eventId}-${participantId}-${lapNumber}-${Date.now()}`,
      eventId,
      participantId,
      participantName,
      participantNumber: '',
      lapNumber,
      lapTime: lapTimeMs,
      isValid: true,
      timestamp: new Date().toISOString(),
      notes,
    };
  }
}

// ============================================================================
// Data Export Service
// ============================================================================

export class AlphaRacehubExporter {
  /**
   * Export lap times as CSV
   */
  static generateCSV(
    event: AlphaRacehubEvent,
    lapTimes: AlphaRacehubLapTime[]
  ): string {
    const headers = [
      'Event',
      'Date',
      'Location',
      'Participant',
      'Lap #',
      'Time',
      'Position',
      'Gap',
      'Notes',
    ];

    const rows = lapTimes.map((lap) => [
      event.name,
      event.date,
      event.location,
      lap.participantName,
      lap.lapNumber,
      AlphaRacehubCSVImporter.formatLapTime(lap.lapTime),
      lap.position || '',
      lap.gap ? AlphaRacehubCSVImporter.formatLapTime(lap.gap) : '',
      lap.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Quote cells containing commas or quotes
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * Export lap times as JSON
   */
  static generateJSON(
    event: AlphaRacehubEvent,
    lapTimes: AlphaRacehubLapTime[]
  ): string {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        event,
        lapTimes,
      },
      null,
      2
    );
  }

  /**
   * Share CSV export via system share sheet
   */
  static async shareAsCSV(
    event: AlphaRacehubEvent,
    lapTimes: AlphaRacehubLapTime[]
  ): Promise<void> {
    try {
      const csvContent = this.generateCSV(event, lapTimes);
      const fileName = `Alpha_Racehub_${event.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Lap Times',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Failed to share CSV:', error);
      throw error;
    }
  }

  /**
   * Share JSON export via system share sheet
   */
  static async shareAsJSON(
    event: AlphaRacehubEvent,
    lapTimes: AlphaRacehubLapTime[]
  ): Promise<void> {
    try {
      const jsonContent = this.generateJSON(event, lapTimes);
      const fileName = `Alpha_Racehub_${event.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Share Lap Times',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Failed to share JSON:', error);
      throw error;
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate statistics from lap times
 */
export function calculateLapStatistics(lapTimes: AlphaRacehubLapTime[]) {
  if (lapTimes.length === 0) {
    return {
      bestLapTime: 0,
      averageLapTime: 0,
      totalLaps: 0,
      validLaps: 0,
      improvementRate: 0,
    };
  }

  const validLaps = lapTimes.filter((lap) => lap.isValid);
  const bestLapTime = validLaps.length > 0
    ? Math.min(...validLaps.map((lap) => lap.lapTime))
    : 0;

  const totalTime = validLaps.reduce((sum, lap) => sum + lap.lapTime, 0);
  const averageLapTime = validLaps.length > 0 ? totalTime / validLaps.length : 0;

  let improvementRate = 0;
  if (validLaps.length > 1) {
    const firstLap = validLaps[0].lapTime;
    const lastLap = validLaps[validLaps.length - 1].lapTime;
    improvementRate = ((firstLap - lastLap) / firstLap) * 100;
  }

  return {
    bestLapTime,
    averageLapTime,
    totalLaps: lapTimes.length,
    validLaps: validLaps.length,
    improvementRate,
  };
}

/**
 * Calculate delta from best lap
 */
export function calculateDeltaToBest(lapTime: number, bestLapTime: number): number {
  return lapTime - bestLapTime;
}

/**
 * Format gap time
 */
export function formatGapTime(ms: number): string {
  const sign = ms < 0 ? '-' : '+';
  const absMs = Math.abs(ms);
  const seconds = Math.floor(absMs / 1000);
  const milliseconds = absMs % 1000;
  return `${sign}${seconds}.${String(milliseconds).padStart(3, '0')}`;
}
