import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { TimingPlatformSelector, LiveTimingDisplay } from '@/components/timing-platform-selector';
import { useTimingPlatform, useLiveEventMonitoring, useParticipantLapTracking, useSetupPerformanceTracking } from '@/hooks/use-timing-platform';
import { useCorrelationAnalyzer } from '@/hooks/use-correlation-analyzer';
import type { TimingPlatformType } from '@/lib/services/timing-platform-registry';
import { cn } from '@/lib/utils';

/**
 * Live Timing Screen
 * 
 * Allows users to:
 * 1. Select their track's timing platform (Speedhive, Race Monitor, etc.)
 * 2. View live lap times in real-time
 * 3. See setup performance analysis
 * 4. Compare current setup performance with historical data
 */
export default function LiveTimingScreen() {
  const {
    selectedPlatform,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useTimingPlatform();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'platform' | 'event' | 'performance'>('platform');

  const { eventData, loading: eventLoading, error: eventError } = useLiveEventMonitoring(
    isConnected ? selectedEventId : null
  );

  const { lapTimes, loading: lapLoading, error: lapError } = useParticipantLapTracking(
    isConnected ? selectedEventId : null,
    selectedParticipantId
  );

  const { performance, loading: perfLoading } = useSetupPerformanceTracking(
    isConnected ? selectedEventId : null,
    selectedParticipantId,
    null // setupId would come from current setup context
  );

  const handleConnect = async (platformId: TimingPlatformType, credentials: Record<string, string>) => {
    const success = await connect(platformId, credentials);
    if (success) {
      setViewMode('event');
    }
    return success;
  };

  // ========================================================================
  // Platform Selection View
  // ========================================================================

  if (!isConnected) {
    return (
      <ScreenContainer className="flex-1 p-4">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-4">
            <View>
              <Text className="text-2xl font-bold text-foreground mb-1">
                Live Timing
              </Text>
              <Text className="text-sm text-muted">
                Connect to your track's timing system to see live lap times
              </Text>
            </View>

            <TimingPlatformSelector
              onConnect={handleConnect}
              isConnecting={isConnecting}
              error={error}
              selectedPlatform={selectedPlatform}
              onDisconnect={disconnect}
            />

            {/* Info Cards */}
            <View className="gap-2 mt-4">
              <View className="bg-primary/10 border border-primary rounded-lg p-3">
                <Text className="text-xs font-semibold text-primary mb-1">
                  💡 Supported Platforms
                </Text>
                <Text className="text-xs text-primary leading-relaxed">
                  • Speedhive (MYLAPS) — No auth required
                  {'\n'}• Race Monitor — API key required
                  {'\n'}• Alpha Racehub — CSV export URL
                  {'\n'}• MyLaps, Timing Solutions, TrackTime
                </Text>
              </View>

              <View className="bg-success/10 border border-success rounded-lg p-3">
                <Text className="text-xs font-semibold text-success mb-1">
                  ✓ Live Features
                </Text>
                <Text className="text-xs text-success leading-relaxed">
                  • Real-time lap time tracking
                  {'\n'}• Setup performance analysis
                  {'\n'}• Improvement trends
                  {'\n'}• Correlation with setup changes
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ========================================================================
  // Event Selection View
  // ========================================================================

  if (viewMode === 'event' && !selectedEventId) {
    return (
      <ScreenContainer className="flex-1 p-4">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  Live Timing
                </Text>
                <Text className="text-xs text-success">● Connected</Text>
              </View>
              <TouchableOpacity
                onPress={disconnect}
                className="px-3 py-2 bg-error/10 rounded-lg border border-error"
              >
                <Text className="text-xs font-semibold text-error">
                  Disconnect
                </Text>
              </TouchableOpacity>
            </View>

            {eventLoading ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#0a7ea4" />
                <Text className="text-muted mt-2">Loading events...</Text>
              </View>
            ) : eventData ? (
              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-1">
                    {eventData.eventName}
                  </Text>
                  <Text className="text-xs text-muted">
                    {eventData.trackName} • {eventData.sessionType}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-xs text-muted">Status</Text>
                    <Text className={cn(
                      'text-sm font-semibold',
                      eventData.status === 'live' ? 'text-success' : 'text-muted'
                    )}>
                      {eventData.status === 'live' ? '🔴 LIVE' : eventData.status}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted">Current Lap</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {eventData.currentLap}/{eventData.totalLaps || '—'}
                    </Text>
                  </View>
                  {eventData.timeRemaining && (
                    <View>
                      <Text className="text-xs text-muted">Time Left</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {Math.floor(eventData.timeRemaining / 60)}:
                        {(eventData.timeRemaining % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedEventId(eventData.eventId)}
                  className="bg-primary rounded-lg p-3 mt-2"
                >
                  <Text className="text-center text-sm font-semibold text-background">
                    View Live Timing
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-muted/10 rounded-lg p-4 border border-border">
                <Text className="text-sm text-muted">
                  No active events found. Check your platform connection.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ========================================================================
  // Live Timing View
  // ========================================================================

  return (
    <ScreenContainer className="flex-1 p-4">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">
                Live Timing
              </Text>
              <Text className="text-xs text-success">● Connected</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedEventId(null)}
              className="px-3 py-2 bg-muted/20 rounded-lg"
            >
              <Text className="text-xs font-semibold text-foreground">
                Back
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1 border border-border">
            {(['live', 'performance'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setViewMode(tab === 'live' ? 'event' : 'performance')}
                className={cn(
                  'flex-1 py-2 px-3 rounded',
                  (viewMode === 'event' && tab === 'live') || (viewMode === 'performance' && tab === 'performance')
                    ? 'bg-primary'
                    : 'bg-transparent'
                )}
              >
                <Text
                  className={cn(
                    'text-xs font-semibold text-center',
                    (viewMode === 'event' && tab === 'live') || (viewMode === 'performance' && tab === 'performance')
                      ? 'text-background'
                      : 'text-muted'
                  )}
                >
                  {tab === 'live' ? '🔴 Live' : '📊 Performance'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Live Timing Tab */}
          {viewMode === 'event' && (
            <View className="gap-3">
              <LiveTimingDisplay
                eventData={eventData}
                participantLapTimes={lapTimes}
                loading={eventLoading || lapLoading}
                error={eventError || lapError}
              />

              {/* Participant Selection */}
              {eventData && eventData.participants && eventData.participants.length > 0 && (
                <View className="gap-2">
                  <Text className="text-xs font-semibold text-muted">
                    Select Participant
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {eventData.participants.map((participant: any) => (
                      <TouchableOpacity
                        key={participant.participantId}
                        onPress={() => setSelectedParticipantId(participant.participantId)}
                        className={cn(
                          'px-3 py-2 rounded-lg border min-w-[120px]',
                          selectedParticipantId === participant.participantId
                            ? 'bg-primary border-primary'
                            : 'bg-surface border-border'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold text-center',
                            selectedParticipantId === participant.participantId
                              ? 'text-background'
                              : 'text-foreground'
                          )}
                        >
                          #{participant.kartNumber}
                        </Text>
                        <Text
                          className={cn(
                            'text-xs text-center',
                            selectedParticipantId === participant.participantId
                              ? 'text-background/80'
                              : 'text-muted'
                          )}
                        >
                          {participant.position}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Performance Tab */}
          {viewMode === 'performance' && (
            <View className="gap-3">
              {perfLoading ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="large" color="#0a7ea4" />
                  <Text className="text-muted mt-2">Analyzing performance...</Text>
                </View>
              ) : performance ? (
                <View className="gap-3">
                  {/* Best Lap */}
                  <View className="bg-success/10 rounded-lg p-4 border border-success">
                    <Text className="text-xs text-success font-semibold mb-2">
                      Best Lap
                    </Text>
                    <Text className="text-2xl font-bold text-success">
                      {formatLapTime(performance.bestLap)}
                    </Text>
                    <Text className="text-xs text-success mt-1">
                      {performance.lapCount} laps recorded
                    </Text>
                  </View>

                  {/* Average Lap */}
                  <View className="bg-primary/10 rounded-lg p-4 border border-primary">
                    <Text className="text-xs text-primary font-semibold mb-2">
                      Average Lap
                    </Text>
                    <Text className="text-2xl font-bold text-primary">
                      {formatLapTime(performance.averageLap)}
                    </Text>
                  </View>

                  {/* Improvement Trend */}
                  <View className={cn(
                    'rounded-lg p-4 border',
                    performance.improvementTrend > 0
                      ? 'bg-success/10 border-success'
                      : 'bg-warning/10 border-warning'
                  )}>
                    <Text className={cn(
                      'text-xs font-semibold mb-2',
                      performance.improvementTrend > 0
                        ? 'text-success'
                        : 'text-warning'
                    )}>
                      Improvement Trend
                    </Text>
                    <Text className={cn(
                      'text-2xl font-bold',
                      performance.improvementTrend > 0
                        ? 'text-success'
                        : 'text-warning'
                    )}>
                      {performance.improvementTrend > 0 ? '↓' : '↑'}{' '}
                      {Math.abs(performance.improvementTrend).toFixed(1)}%
                    </Text>
                    <Text className={cn(
                      'text-xs mt-1',
                      performance.improvementTrend > 0
                        ? 'text-success'
                        : 'text-warning'
                    )}>
                      {performance.improvementTrend > 0
                        ? 'Getting faster'
                        : 'Getting slower'}
                    </Text>
                  </View>

                  {/* Setup Recommendation */}
                  <View className="bg-primary/10 rounded-lg p-4 border border-primary">
                    <Text className="text-xs text-primary font-semibold mb-2">
                      💡 Tip
                    </Text>
                    <Text className="text-xs text-primary leading-relaxed">
                      Compare this setup's performance with historical data to identify which parameters work best for this track.
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="bg-muted/10 rounded-lg p-4 border border-border">
                  <Text className="text-sm text-muted">
                    No performance data available. Select a participant to track.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Format lap time for display
 */
function formatLapTime(ms: number | null): string {
  if (!ms) return '—';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(3, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
}
