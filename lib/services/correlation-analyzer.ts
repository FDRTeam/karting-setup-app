import type { KartingSession } from '@/lib/types';
import type { UnifiedLapTime } from './lap-aggregator';

/**
 * Correlation analysis for setup parameters vs lap times
 */

export interface CorrelationDataPoint {
  setupId: string;
  setupName: string;
  lapTimes: number[];
  bestLap: number;
  averageLap: number;
  
  // Tire parameters
  tireFrontLeftPSI: number;
  tireFrontRightPSI: number;
  tireRearLeftPSI: number;
  tireRearRightPSI: number;
  averageTirePSI: number;
  
  // Chassis parameters
  frontCasterLeft: number;
  frontCasterRight: number;
  frontCamberLeft: number;
  frontCamberRight: number;
  frontToeLeft: number;
  frontToeRight: number;
  rearCasterLeft: number;
  rearCasterRight: number;
  rearCamberLeft: number;
  rearCamberRight: number;
  rearToeLeft: number;
  rearToeRight: number;
  axleStiffness: string;
  
  // Weight distribution
  frontLeftWeight: number;
  frontRightWeight: number;
  rearLeftWeight: number;
  rearRightWeight: number;
  crossWeight: number;
  
  // Engine
  engineType: string;
  sparkPlug: string;
}

export interface CorrelationResult {
  parameter: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative'; // positive = higher value = faster lap
  pValue: number; // statistical significance
  rSquared: number; // coefficient of determination
  sampleSize: number;
  trend: 'improving' | 'declining' | 'neutral';
}

export interface CorrelationAnalysis {
  totalDataPoints: number;
  tireCorrelations: CorrelationResult[];
  chassisCorrelations: CorrelationResult[];
  weightCorrelations: CorrelationResult[];
  engineCorrelations: CorrelationResult[];
  topFactors: CorrelationResult[];
  recommendations: string[];
}

export interface SetupComparison {
  setup1: CorrelationDataPoint;
  setup2: CorrelationDataPoint;
  lapTimeDifference: number;
  lapTimePercentDifference: number;
  parameterDifferences: ParameterDifference[];
  likelyContributors: string[];
}

export interface ParameterDifference {
  parameter: string;
  setup1Value: number | string;
  setup2Value: number | string;
  difference: number | string;
  estimatedImpact: number; // estimated lap time impact in ms
}

/**
 * Correlation Analyzer
 */
export class CorrelationAnalyzer {
  private dataPoints: CorrelationDataPoint[] = [];

  /**
   * Add a data point (setup + lap times)
   */
  addDataPoint(
    setup: KartingSession,
    lapTimes: UnifiedLapTime[]
  ): void {
    const validLaps = lapTimes.filter((l) => l.isValid);
    if (validLaps.length === 0) return;

    const lapTimeValues = validLaps.map((l) => l.lapTime);
    const bestLap = Math.min(...lapTimeValues);
    const averageLap = lapTimeValues.reduce((a, b) => a + b, 0) / lapTimeValues.length;

    const dataPoint: CorrelationDataPoint = {
      setupId: setup.id,
      setupName: `${setup.trackName || 'Unknown'} - ${new Date(setup.date).toLocaleDateString()}`,
      lapTimes: lapTimeValues,
      bestLap,
      averageLap,
      
      // Tire parameters
      tireFrontLeftPSI: setup.tireSetup?.pressureFrontLeft || 0,
      tireFrontRightPSI: setup.tireSetup?.pressureFrontRight || 0,
      tireRearLeftPSI: setup.tireSetup?.pressureRearLeft || 0,
      tireRearRightPSI: setup.tireSetup?.pressureRearRight || 0,
      averageTirePSI: this.calculateAverageTirePSI(setup),
      
      // Chassis parameters
      frontCasterLeft: setup.chassisSetup?.frontLeft.caster || 0,
      frontCasterRight: setup.chassisSetup?.frontRight.caster || 0,
      frontCamberLeft: setup.chassisSetup?.frontLeft.camber || 0,
      frontCamberRight: setup.chassisSetup?.frontRight.camber || 0,
      frontToeLeft: setup.chassisSetup?.frontLeft.toe || 0,
      frontToeRight: setup.chassisSetup?.frontRight.toe || 0,
      rearCasterLeft: 0,
      rearCasterRight: 0,
      rearCamberLeft: 0,
      rearCamberRight: 0,
      rearToeLeft: 0,
      rearToeRight: 0,
      axleStiffness: setup.chassisSetup?.axleStiffness || 'M2',
      
      // Weight distribution
      frontLeftWeight: setup.weightDistribution?.frontLeftWeight || 0,
      frontRightWeight: setup.weightDistribution?.frontRightWeight || 0,
      rearLeftWeight: setup.weightDistribution?.rearLeftWeight || 0,
      rearRightWeight: setup.weightDistribution?.rearRightWeight || 0,
      crossWeight: (setup.weightDistribution?.crossWeightPercentage || 0),
      
      // Engine
      engineType: setup.engineSetup?.type || 'Unknown',
      sparkPlug: setup.engineSetup?.sparkPlug || 'Unknown',
    };

    this.dataPoints.push(dataPoint);
  }

  /**
   * Calculate average tire PSI
   */
  private calculateAverageTirePSI(setup: KartingSession): number {
    const psis = [
      setup.tireSetup?.pressureFrontLeft || 0,
      setup.tireSetup?.pressureFrontRight || 0,
      setup.tireSetup?.pressureRearLeft || 0,
      setup.tireSetup?.pressureRearRight || 0,
    ].filter((p) => p > 0);

    return psis.length > 0 ? psis.reduce((a, b) => a + b, 0) / psis.length : 0;
  }

  /**
   * Analyze correlations
   */
  analyzeCorrelations(): CorrelationAnalysis {
    if (this.dataPoints.length < 2) {
      return {
        totalDataPoints: this.dataPoints.length,
        tireCorrelations: [],
        chassisCorrelations: [],
        weightCorrelations: [],
        engineCorrelations: [],
        topFactors: [],
        recommendations: ['Need at least 2 data points for correlation analysis'],
      };
    }

    const tireCorrelations = [
      this.calculateCorrelation('averageTirePSI', 'bestLap'),
      this.calculateCorrelation('tireFrontLeftPSI', 'bestLap'),
      this.calculateCorrelation('tireFrontRightPSI', 'bestLap'),
      this.calculateCorrelation('tireRearLeftPSI', 'bestLap'),
      this.calculateCorrelation('tireRearRightPSI', 'bestLap'),
    ].filter((c) => c !== null) as CorrelationResult[];

    const chassisCorrelations = [
      this.calculateCorrelation('frontCasterLeft', 'bestLap'),
      this.calculateCorrelation('frontCasterRight', 'bestLap'),
      this.calculateCorrelation('frontCamberLeft', 'bestLap'),
      this.calculateCorrelation('frontCamberRight', 'bestLap'),
      this.calculateCorrelation('frontToeLeft', 'bestLap'),
      this.calculateCorrelation('frontToeRight', 'bestLap'),
      this.calculateCorrelation('rearCasterLeft', 'bestLap'),
      this.calculateCorrelation('rearCasterRight', 'bestLap'),
      this.calculateCorrelation('rearCamberLeft', 'bestLap'),
      this.calculateCorrelation('rearCamberRight', 'bestLap'),
      this.calculateCorrelation('rearToeLeft', 'bestLap'),
      this.calculateCorrelation('rearToeRight', 'bestLap'),
    ].filter((c) => c !== null) as CorrelationResult[];

    const weightCorrelations = [
      this.calculateCorrelation('frontLeftWeight', 'bestLap'),
      this.calculateCorrelation('frontRightWeight', 'bestLap'),
      this.calculateCorrelation('rearLeftWeight', 'bestLap'),
      this.calculateCorrelation('rearRightWeight', 'bestLap'),
      this.calculateCorrelation('crossWeight', 'bestLap'),
    ].filter((c) => c !== null) as CorrelationResult[];

    const engineCorrelations: CorrelationResult[] = [];

    const allCorrelations = [
      ...tireCorrelations,
      ...chassisCorrelations,
      ...weightCorrelations,
      ...engineCorrelations,
    ];

    const topFactors = allCorrelations
      .filter((c) => c.strength !== 'none')
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 5);

    const recommendations = this.generateRecommendations(topFactors);

    return {
      totalDataPoints: this.dataPoints.length,
      tireCorrelations,
      chassisCorrelations,
      weightCorrelations,
      engineCorrelations,
      topFactors,
      recommendations,
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private calculateCorrelation(
    parameterKey: keyof CorrelationDataPoint,
    targetKey: keyof CorrelationDataPoint
  ): CorrelationResult | null {
    const values = this.dataPoints.map((dp) => ({
      x: dp[parameterKey] as number,
      y: dp[targetKey] as number,
    }));

    // Filter out invalid values
    const validValues = values.filter((v) => typeof v.x === 'number' && typeof v.y === 'number' && v.x !== 0);
    if (validValues.length < 2) return null;

    const n = validValues.length;
    const meanX = validValues.reduce((sum, v) => sum + v.x, 0) / n;
    const meanY = validValues.reduce((sum, v) => sum + v.y, 0) / n;

    const numerator = validValues.reduce((sum, v) => sum + (v.x - meanX) * (v.y - meanY), 0);
    const denominator = Math.sqrt(
      validValues.reduce((sum, v) => sum + Math.pow(v.x - meanX, 2), 0) *
      validValues.reduce((sum, v) => sum + Math.pow(v.y - meanY, 2), 0)
    );

    if (denominator === 0) return null;

    const correlation = numerator / denominator;
    const rSquared = Math.pow(correlation, 2);
    const tStatistic = correlation * Math.sqrt((n - 2) / (1 - rSquared));
    const pValue = this.calculatePValue(tStatistic, n - 2);

    const strength = this.getCorrelationStrength(Math.abs(correlation));
    const direction = correlation > 0 ? 'positive' : 'negative';
    const trend = correlation > 0 ? 'improving' : 'declining';

    return {
      parameter: String(parameterKey),
      correlation,
      strength,
      direction,
      pValue,
      rSquared,
      sampleSize: n,
      trend,
    };
  }

  /**
   * Get correlation strength label
   */
  private getCorrelationStrength(
    absCorrelation: number
  ): 'strong' | 'moderate' | 'weak' | 'none' {
    if (absCorrelation >= 0.7) return 'strong';
    if (absCorrelation >= 0.4) return 'moderate';
    if (absCorrelation >= 0.2) return 'weak';
    return 'none';
  }

  /**
   * Approximate p-value using t-distribution
   */
  private calculatePValue(tStatistic: number, degreesOfFreedom: number): number {
    // Simplified p-value calculation
    // For a more accurate calculation, use a statistical library
    const absT = Math.abs(tStatistic);
    if (absT > 3) return 0.01;
    if (absT > 2) return 0.05;
    if (absT > 1) return 0.1;
    return 0.5;
  }

  /**
   * Generate recommendations based on correlations
   */
  private generateRecommendations(topFactors: CorrelationResult[]): string[] {
    const recommendations: string[] = [];

    topFactors.forEach((factor) => {
      if (factor.strength === 'strong') {
        if (factor.direction === 'positive') {
          recommendations.push(
            `Strong positive correlation: Increasing ${factor.parameter} improves lap times`
          );
        } else {
          recommendations.push(
            `Strong negative correlation: Decreasing ${factor.parameter} improves lap times`
          );
        }
      } else if (factor.strength === 'moderate') {
        if (factor.direction === 'positive') {
          recommendations.push(
            `Moderate correlation: Consider increasing ${factor.parameter} for potential improvement`
          );
        } else {
          recommendations.push(
            `Moderate correlation: Consider decreasing ${factor.parameter} for potential improvement`
          );
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('No strong correlations found. Continue collecting data.');
    }

    return recommendations;
  }

  /**
   * Compare two setups
   */
  compareSetups(setupId1: string, setupId2: string): SetupComparison | null {
    const setup1 = this.dataPoints.find((dp) => dp.setupId === setupId1);
    const setup2 = this.dataPoints.find((dp) => dp.setupId === setupId2);

    if (!setup1 || !setup2) return null;

    const lapTimeDifference = setup2.bestLap - setup1.bestLap;
    const lapTimePercentDifference = (lapTimeDifference / setup1.bestLap) * 100;

    const parameterDifferences: ParameterDifference[] = [
      {
        parameter: 'Average Tire PSI',
        setup1Value: setup1.averageTirePSI.toFixed(1),
        setup2Value: setup2.averageTirePSI.toFixed(1),
        difference: (setup2.averageTirePSI - setup1.averageTirePSI).toFixed(1),
        estimatedImpact: this.estimateParameterImpact('averageTirePSI', setup2.averageTirePSI - setup1.averageTirePSI),
      },
      {
        parameter: 'Front Left Caster',
        setup1Value: setup1.frontCasterLeft.toFixed(2),
        setup2Value: setup2.frontCasterLeft.toFixed(2),
        difference: (setup2.frontCasterLeft - setup1.frontCasterLeft).toFixed(2),
        estimatedImpact: this.estimateParameterImpact('frontCasterLeft', setup2.frontCasterLeft - setup1.frontCasterLeft),
      },
      {
        parameter: 'Front Left Camber',
        setup1Value: setup1.frontCamberLeft.toFixed(2),
        setup2Value: setup2.frontCamberLeft.toFixed(2),
        difference: (setup2.frontCamberLeft - setup1.frontCamberLeft).toFixed(2),
        estimatedImpact: this.estimateParameterImpact('frontCamberLeft', setup2.frontCamberLeft - setup1.frontCamberLeft),
      },
      {
        parameter: 'Front Left Toe',
        setup1Value: setup1.frontToeLeft.toFixed(2),
        setup2Value: setup2.frontToeLeft.toFixed(2),
        difference: (setup2.frontToeLeft - setup1.frontToeLeft).toFixed(2),
        estimatedImpact: this.estimateParameterImpact('frontToeLeft', setup2.frontToeLeft - setup1.frontToeLeft),
      },
    ];

    const likelyContributors = parameterDifferences
      .filter((pd) => Math.abs(pd.estimatedImpact) > 10)
      .map((pd) => pd.parameter);

    return {
      setup1,
      setup2,
      lapTimeDifference,
      lapTimePercentDifference,
      parameterDifferences,
      likelyContributors,
    };
  }

  /**
   * Estimate parameter impact on lap time
   */
  private estimateParameterImpact(parameter: string, change: number): number {
    // Rough estimates based on karting physics
    const impacts: Record<string, number> = {
      averageTirePSI: 50, // 1 PSI ≈ 50ms per lap
      frontCasterLeft: 10,
      frontCasterRight: 10,
      frontCamberLeft: 15,
      frontCamberRight: 15,
      frontToeLeft: 20,
      frontToeRight: 20,
      rearCasterLeft: 5,
      rearCasterRight: 5,
      rearCamberLeft: 10,
      rearCamberRight: 10,
      rearToeLeft: 15,
      rearToeRight: 15,
      crossWeight: 30,
    };

    const impactPerUnit = impacts[parameter] || 0;
    return impactPerUnit * change;
  }

  /**
   * Get all data points
   */
  getDataPoints(): CorrelationDataPoint[] {
    return [...this.dataPoints];
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.dataPoints = [];
  }
}
