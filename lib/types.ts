/**
 * Karting Setup Data Types
 */

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  windSpeed: number; // km/h
  windDirection: number; // Degrees
  trackAsphaltTemp: number; // Celsius
  conditions: string; // e.g., "Clear", "Rainy"
  timestamp: string;
  sensorFocused?: number; // ThingSpeak Field 1: Focused sensor temperature
  sensorWide?: number; // ThingSpeak Field 2: Wide sensor temperature
}

export interface TireSetup {
  type: string; // e.g., "MG Orange", "MG Red", "Vega Red"
  pressureFrontLeft: number; // PSI
  pressureFrontRight: number; // PSI
  pressureRearLeft: number; // PSI
  pressureRearRight: number; // PSI
  rimBrand: string;
  rimMetallurgy: string; // e.g., "Aluminum", "Magnesium"
  weightDistribution: {
    frontLeft: number; // Weight in kg or lbs
    frontRight: number; // Weight in kg or lbs
    rearLeft: number; // Weight in kg or lbs
    rearRight: number; // Weight in kg or lbs
  };
}

export interface ChassisSetup {
  type: string; // e.g., "Birel Art", "Tony Kart", "CRG", "TB Kart"
  serialNumber: string; // Chassis serial number
  frontLeft: {
    caster: number; // Degrees
    camber: number; // Degrees
    toe: number; // Degrees
  };
  frontRight: {
    caster: number; // Degrees
    camber: number; // Degrees
    toe: number; // Degrees
  };
  axleBrand: string;
  axleWidth?: number; // mm
  axleBrandOther?: string; // Custom brand name when "Other" is selected
  axleStiffness: string; // e.g., "S", "M1", "M2", "M3", "H1", "H2"
}

export interface EngineSetup {
  type: string; // e.g., "B+S LO206", "IAME Micro-Swift", "IAME Mini-Swift", "IAME KA100 Jr", "IAME KA100 Sr"
  serialNumber: string;
  sparkPlug?: string; // e.g., "AR50", "AR51", "AR3910X", "BR10EG"
  lastSparkPlugChangeDate?: string; // ISO date string (YYYY-MM-DD)
  lastSparkPlugChangeTime?: string; // Time string (HH:MM 24-hour format)
  lastOilChangeDate?: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
}

export interface GearingSetup {
  frontDriver: number; // Front driver teeth count
  rearSprocket: number; // Rear sprocket teeth count
  ratio?: number; // Calculated ratio (rearSprocket / frontDriver)
}

export interface WidthSetup {
  frontWidth: string; // Spacer configuration (5mm, 10mm, 15mm, 20mm, etc.)
  rearWidth: number; // Measurement in mm
  rearWidthUnit: string; // "mm" or "inches"
}

export interface RideHeightSetup {
  frontRideHeight: string; // "Low", "Standard", or "High"
  rearRideHeight: string; // "Low", "Standard", or "High"
}

export interface WeightDistribution {
  frontLeftWeight: number; // lbs
  frontRightWeight: number; // lbs
  rearLeftWeight: number; // lbs
  rearRightWeight: number; // lbs
  crossWeightPercentage: number; // (FL + RR) / Total
  totalWeight: number; // lbs
}

export interface KartingSession {
  id: string;
  kartNumber: string; // Kart number/identifier
  trackName: string;
  trackLayout: string; // e.g., "Lawson", "National", "Coyote"
  trackLocation: {
    latitude: number;
    longitude: number;
  };
  date: string; // ISO 8601
  weather: WeatherData;
  tireSetup: TireSetup;
  chassisSetup: ChassisSetup;
  engineSetup: EngineSetup;
  gearingSetup: GearingSetup;
  widthSetup?: WidthSetup; // Front and rear width configuration
  rideHeightSetup?: RideHeightSetup; // Front and rear ride height configuration
  weightDistribution: WeightDistribution;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cloudId?: string | number; // Cloud database ID (optional)
  syncedAt?: string; // ISO 8601 timestamp of last cloud sync (optional)
  // Performance tracking
  bestLapTime?: number; // Best lap time in seconds
  averageLapTime?: number; // Average lap time in seconds
  lapCount?: number; // Total number of laps completed
  performanceNotes?: string; // User observations about performance
}

export interface TrackLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface LapTime {
  sessionId: string;
  lapNumber: number;
  lapTime: number; // in seconds
  recordedAt: string; // ISO 8601
}

export interface PerformanceAnalysis {
  sessionId: string;
  weatherConditions: string; // Summary of weather conditions
  temperature: number; // Celsius
  humidity: number; // Percentage
  windSpeed: number; // km/h
  windDirection: number; // Degrees
  bestLapTime: number; // seconds
  averageLapTime: number; // seconds
  lapCount: number;
  setupSummary: {
    tireType: string;
    chassisType: string;
    engineType: string;
    gearRatio: number;
  };
  performanceNotes: string;
  correlationScore?: number; // 0-100 score indicating setup effectiveness
}
