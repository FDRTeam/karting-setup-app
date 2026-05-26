import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { cn } from '@/lib/utils';
import { ScreenContainer } from './screen-container';
import type { CorrelationAnalysis, SetupComparison } from '@/lib/services/correlation-analyzer';

interface CorrelationAnalysisViewProps {
  analysis: CorrelationAnalysis | null;
  loading: boolean;
  onCompareSetups?: (setupId1: string, setupId2: string) => void;
}

/**
 * Correlation Analysis Visualization Component
 */
export function CorrelationAnalysisView({
  analysis,
  loading,
  onCompareSetups,
}: CorrelationAnalysisViewProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'tires' | 'chassis' | 'weight'>('overview');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Analyzing correlations...</Text>
      </ScreenContainer>
    );
  }

  if (!analysis || analysis.totalDataPoints < 2) {
    return (
      <ScreenContainer className="items-center justify-center p-4">
        <Text className="text-lg font-semibold text-foreground mb-2">
          Insufficient Data
        </Text>
        <Text className="text-sm text-muted text-center">
          Need at least 2 setups with lap times to analyze correlations.
        </Text>
      </ScreenContainer>
    );
  }

  const getCorrelationColor = (correlation: number): string => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'bg-success/20 border-success';
    if (abs >= 0.4) return 'bg-warning/20 border-warning';
    if (abs >= 0.2) return 'bg-primary/20 border-primary';
    return 'bg-muted/10 border-border';
  };

  const getCorrelationLabel = (correlation: number): string => {
    const abs = Math.abs(correlation);
    const direction = correlation > 0 ? '↑' : '↓';
    if (abs >= 0.7) return `${direction} Strong`;
    if (abs >= 0.4) return `${direction} Moderate`;
    if (abs >= 0.2) return `${direction} Weak`;
    return 'None';
  };

  // ========================================================================
  // Overview Tab
  // ========================================================================

  const OverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-4">
        {/* Summary */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Analysis Summary
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Data Points</Text>
              <Text className="text-sm font-semibold text-foreground">
                {analysis.totalDataPoints}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Strong Correlations</Text>
              <Text className="text-sm font-semibold text-foreground">
                {analysis.topFactors.filter((f) => f.strength === 'strong').length}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Moderate Correlations</Text>
              <Text className="text-sm font-semibold text-foreground">
                {analysis.topFactors.filter((f) => f.strength === 'moderate').length}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Factors */}
        {analysis.topFactors.length > 0 && (
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground px-4">
              Top Performance Factors
            </Text>
            {analysis.topFactors.map((factor, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedFactor(factor.parameter);
                  setShowDetails(true);
                }}
                className={cn(
                  'mx-4 rounded-lg p-3 border',
                  getCorrelationColor(factor.correlation)
                )}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {factor.parameter}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {factor.direction === 'positive' ? 'Higher is faster' : 'Lower is faster'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-primary">
                      {factor.correlation.toFixed(2)}
                    </Text>
                    <Text className="text-xs text-muted">
                      {getCorrelationLabel(factor.correlation)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <View className="bg-primary/10 rounded-lg p-4 border border-primary">
            <Text className="text-sm font-semibold text-foreground mb-2">
              💡 Recommendations
            </Text>
            {analysis.recommendations.map((rec, index) => (
              <Text key={index} className="text-xs text-muted mb-1 leading-relaxed">
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ========================================================================
  // Tire Correlations Tab
  // ========================================================================

  const TireTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground px-4 mt-4">
          Tire Pressure Impact
        </Text>
        {analysis.tireCorrelations.map((corr, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSelectedFactor(corr.parameter);
              setShowDetails(true);
            }}
            className={cn(
              'mx-4 rounded-lg p-3 border',
              getCorrelationColor(corr.correlation)
            )}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {corr.parameter === 'averageTirePSI'
                    ? 'Average PSI'
                    : corr.parameter === 'tireFrontLeftPSI'
                      ? 'Front Left PSI'
                      : corr.parameter === 'tireFrontRightPSI'
                        ? 'Front Right PSI'
                        : corr.parameter === 'tireRearLeftPSI'
                          ? 'Rear Left PSI'
                          : 'Rear Right PSI'}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {corr.direction === 'positive' ? '↑ Higher pressure = faster' : '↓ Lower pressure = faster'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-primary">
                  {corr.correlation.toFixed(2)}
                </Text>
                <Text className="text-xs text-muted">
                  {getCorrelationLabel(corr.correlation)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ========================================================================
  // Chassis Correlations Tab
  // ========================================================================

  const ChassisTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground px-4 mt-4">
          Chassis Geometry Impact
        </Text>

        {/* Caster */}
        <View className="px-4">
          <Text className="text-xs font-semibold text-muted mb-2">Caster</Text>
          {analysis.chassisCorrelations
            .filter((c) => c.parameter.includes('Caster'))
            .map((corr, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedFactor(corr.parameter);
                  setShowDetails(true);
                }}
                className={cn(
                  'rounded-lg p-2 border mb-2',
                  getCorrelationColor(corr.correlation)
                )}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-semibold text-foreground">
                    {corr.parameter.replace('frontCaster', 'Front ').replace('Left', 'Left').replace('Right', 'Right')}
                  </Text>
                  <Text className="text-xs font-bold text-primary">
                    {corr.correlation.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* Camber */}
        <View className="px-4">
          <Text className="text-xs font-semibold text-muted mb-2">Camber</Text>
          {analysis.chassisCorrelations
            .filter((c) => c.parameter.includes('Camber'))
            .map((corr, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedFactor(corr.parameter);
                  setShowDetails(true);
                }}
                className={cn(
                  'rounded-lg p-2 border mb-2',
                  getCorrelationColor(corr.correlation)
                )}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-semibold text-foreground">
                    {corr.parameter.replace('frontCamber', 'Front ').replace('Left', 'Left').replace('Right', 'Right')}
                  </Text>
                  <Text className="text-xs font-bold text-primary">
                    {corr.correlation.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* Toe */}
        <View className="px-4">
          <Text className="text-xs font-semibold text-muted mb-2">Toe</Text>
          {analysis.chassisCorrelations
            .filter((c) => c.parameter.includes('Toe'))
            .map((corr, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedFactor(corr.parameter);
                  setShowDetails(true);
                }}
                className={cn(
                  'rounded-lg p-2 border mb-2',
                  getCorrelationColor(corr.correlation)
                )}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-semibold text-foreground">
                    {corr.parameter.replace('frontToe', 'Front ').replace('Left', 'Left').replace('Right', 'Right')}
                  </Text>
                  <Text className="text-xs font-bold text-primary">
                    {corr.correlation.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </ScrollView>
  );

  // ========================================================================
  // Weight Correlations Tab
  // ========================================================================

  const WeightTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground px-4 mt-4">
          Weight Distribution Impact
        </Text>
        {analysis.weightCorrelations.map((corr, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSelectedFactor(corr.parameter);
              setShowDetails(true);
            }}
            className={cn(
              'mx-4 rounded-lg p-3 border',
              getCorrelationColor(corr.correlation)
            )}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {corr.parameter.replace('Weight', ' Weight')}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {corr.direction === 'positive' ? '↑ More weight = faster' : '↓ Less weight = faster'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-primary">
                  {corr.correlation.toFixed(2)}
                </Text>
                <Text className="text-xs text-muted">
                  {getCorrelationLabel(corr.correlation)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <ScreenContainer className="flex-1">
      {/* Tab Navigation */}
      <View className="flex-row border-b border-border mb-4">
        {(['overview', 'tires', 'chassis', 'weight'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setViewMode(tab)}
            className={cn(
              'flex-1 p-3 border-b-2',
              viewMode === tab ? 'border-primary' : 'border-transparent'
            )}
          >
            <Text
              className={cn(
                'text-center text-xs font-semibold',
                viewMode === tab ? 'text-primary' : 'text-muted'
              )}
            >
              {tab === 'overview'
                ? 'Overview'
                : tab === 'tires'
                  ? 'Tires'
                  : tab === 'chassis'
                    ? 'Chassis'
                    : 'Weight'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {viewMode === 'overview' && <OverviewTab />}
      {viewMode === 'tires' && <TireTab />}
      {viewMode === 'chassis' && <ChassisTab />}
      {viewMode === 'weight' && <WeightTab />}

      {/* Details Modal */}
      <Modal visible={showDetails} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface rounded-lg p-4 w-full max-w-sm gap-3">
            <Text className="text-lg font-semibold text-foreground">
              {selectedFactor || 'Details'}
            </Text>
            <View className="bg-background rounded p-3 gap-2">
              <Text className="text-xs text-muted">
                This parameter shows a correlation with lap times. Higher values indicate stronger
                relationships between the parameter and lap performance.
              </Text>
              <Text className="text-xs text-muted mt-2">
                💡 Tip: Focus on parameters with strong correlations (0.7+) for the biggest
                performance gains.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDetails(false)}
              className="bg-primary rounded-lg p-3"
            >
              <Text className="text-center text-sm font-semibold text-background">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
