import { useState, useCallback, useEffect } from 'react';
import { CorrelationAnalyzer, type CorrelationAnalysis, type SetupComparison } from '@/lib/services/correlation-analyzer';
import type { KartingSession } from '@/lib/types';
import type { UnifiedLapTime } from '@/lib/services/lap-aggregator';

/**
 * Hook for setup-to-laptime correlation analysis
 */
export function useCorrelationAnalyzer(
  setups: KartingSession[],
  lapTimesBySetup: Map<string, UnifiedLapTime[]>
) {
  const [analyzer] = useState(() => new CorrelationAnalyzer());
  const [analysis, setAnalysis] = useState<CorrelationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Add data points and analyze
  useEffect(() => {
    setLoading(true);
    analyzer.clear();

    setups.forEach((setup) => {
      const lapTimes = lapTimesBySetup.get(setup.id) || [];
      if (lapTimes.length > 0) {
        analyzer.addDataPoint(setup, lapTimes);
      }
    });

    const result = analyzer.analyzeCorrelations();
    setAnalysis(result);
    setLoading(false);
  }, [setups, lapTimesBySetup, analyzer]);

  const compareSetups = useCallback(
    (setupId1: string, setupId2: string): SetupComparison | null => {
      return analyzer.compareSetups(setupId1, setupId2);
    },
    [analyzer]
  );

  return {
    analysis,
    loading,
    compareSetups,
    dataPoints: analyzer.getDataPoints(),
  };
}

/**
 * Hook for tire pressure correlation analysis
 */
export function useTirePressureCorrelation(analysis: CorrelationAnalysis | null) {
  const [tireAnalysis, setTireAnalysis] = useState<{
    frontLeftImpact: number;
    frontRightImpact: number;
    rearLeftImpact: number;
    rearRightImpact: number;
    averageImpact: number;
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    if (!analysis) return;

    const frontLeftCorr = analysis.tireCorrelations.find(
      (c) => c.parameter === 'tireFrontLeftPSI'
    );
    const frontRightCorr = analysis.tireCorrelations.find(
      (c) => c.parameter === 'tireFrontRightPSI'
    );
    const rearLeftCorr = analysis.tireCorrelations.find(
      (c) => c.parameter === 'tireRearLeftPSI'
    );
    const rearRightCorr = analysis.tireCorrelations.find(
      (c) => c.parameter === 'tireRearRightPSI'
    );
    const avgCorr = analysis.tireCorrelations.find(
      (c) => c.parameter === 'averageTirePSI'
    );

    const recommendation =
      avgCorr && avgCorr.strength !== 'none'
        ? avgCorr.direction === 'positive'
          ? 'Increase tire pressure for faster lap times'
          : 'Decrease tire pressure for faster lap times'
        : 'Tire pressure impact unclear. Collect more data.';

    setTireAnalysis({
      frontLeftImpact: frontLeftCorr?.correlation || 0,
      frontRightImpact: frontRightCorr?.correlation || 0,
      rearLeftImpact: rearLeftCorr?.correlation || 0,
      rearRightImpact: rearRightCorr?.correlation || 0,
      averageImpact: avgCorr?.correlation || 0,
      recommendation,
    });
  }, [analysis]);

  return tireAnalysis;
}

/**
 * Hook for chassis geometry correlation analysis
 */
export function useChassisCorrelation(analysis: CorrelationAnalysis | null) {
  const [chassisAnalysis, setChassisAnalysis] = useState<{
    casterImpact: number;
    camberImpact: number;
    toeImpact: number;
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    if (!analysis) return;

    const casterCorrs = analysis.chassisCorrelations.filter(
      (c) => c.parameter.includes('Caster')
    );
    const camberCorrs = analysis.chassisCorrelations.filter(
      (c) => c.parameter.includes('Camber')
    );
    const toeCorrs = analysis.chassisCorrelations.filter(
      (c) => c.parameter.includes('Toe')
    );

    const avgCaster =
      casterCorrs.reduce((sum, c) => sum + c.correlation, 0) / Math.max(casterCorrs.length, 1);
    const avgCamber =
      camberCorrs.reduce((sum, c) => sum + c.correlation, 0) / Math.max(camberCorrs.length, 1);
    const avgToe =
      toeCorrs.reduce((sum, c) => sum + c.correlation, 0) / Math.max(toeCorrs.length, 1);

    const recommendations: string[] = [];
    if (Math.abs(avgCaster) > 0.3) {
      recommendations.push(
        avgCaster > 0
          ? 'Increase caster for better lap times'
          : 'Decrease caster for better lap times'
      );
    }
    if (Math.abs(avgCamber) > 0.3) {
      recommendations.push(
        avgCamber > 0
          ? 'Increase camber for better lap times'
          : 'Decrease camber for better lap times'
      );
    }
    if (Math.abs(avgToe) > 0.3) {
      recommendations.push(
        avgToe > 0
          ? 'Increase toe for better lap times'
          : 'Decrease toe for better lap times'
      );
    }

    setChassisAnalysis({
      casterImpact: avgCaster,
      camberImpact: avgCamber,
      toeImpact: avgToe,
      recommendation:
        recommendations.length > 0
          ? recommendations.join('; ')
          : 'Chassis geometry impact unclear. Collect more data.',
    });
  }, [analysis]);

  return chassisAnalysis;
}

/**
 * Hook for weight distribution correlation analysis
 */
export function useWeightCorrelation(analysis: CorrelationAnalysis | null) {
  const [weightAnalysis, setWeightAnalysis] = useState<{
    crossWeightImpact: number;
    frontWeightImpact: number;
    rearWeightImpact: number;
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    if (!analysis) return;

    const crossWeightCorr = analysis.weightCorrelations.find(
      (c) => c.parameter === 'crossWeight'
    );
    const frontWeightCorr = analysis.weightCorrelations.find(
      (c) => c.parameter === 'frontLeftWeight' || c.parameter === 'frontRightWeight'
    );
    const rearWeightCorr = analysis.weightCorrelations.find(
      (c) => c.parameter === 'rearLeftWeight' || c.parameter === 'rearRightWeight'
    );

    const recommendations: string[] = [];
    if (crossWeightCorr && crossWeightCorr.strength !== 'none') {
      recommendations.push(
        crossWeightCorr.direction === 'positive'
          ? 'Increase cross-weight percentage for better lap times'
          : 'Decrease cross-weight percentage for better lap times'
      );
    }

    setWeightAnalysis({
      crossWeightImpact: crossWeightCorr?.correlation || 0,
      frontWeightImpact: frontWeightCorr?.correlation || 0,
      rearWeightImpact: rearWeightCorr?.correlation || 0,
      recommendation:
        recommendations.length > 0
          ? recommendations.join('; ')
          : 'Weight distribution impact unclear. Collect more data.',
    });
  }, [analysis]);

  return weightAnalysis;
}

/**
 * Hook for finding optimal setup parameters based on correlations
 */
export function useOptimalSetupSuggestions(analysis: CorrelationAnalysis | null) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!analysis) return;

    const newSuggestions: string[] = [];

    // Add top factor recommendations
    analysis.topFactors.forEach((factor) => {
      if (factor.strength === 'strong') {
        newSuggestions.push(`${factor.parameter}: ${factor.direction} correlation (strong)`);
      }
    });

    // Add general recommendations
    newSuggestions.push(...analysis.recommendations);

    setSuggestions(newSuggestions);
  }, [analysis]);

  return suggestions;
}
