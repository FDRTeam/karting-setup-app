import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLapAggregator, useLapSorting, useLapStatistics } from '@/hooks/use-lap-aggregator';
import { cn } from '@/lib/utils';
import { ScreenContainer } from './screen-container';

type ViewMode = 'overview' | 'sessions' | 'trends' | 'comparison' | 'live';

/**
 * Multi-Event Lap Aggregation View
 * 
 * Combines lap times from multiple platforms and events into unified views
 * with analytics, trends, and performance comparisons.
 */
export function LapAggregationView() {
  const { lapTimes, sessions, stats, addSpeedhiveLaps, clear } = useLapAggregator();
  const { sortedLaps, sortBy, setSortBy } = useLapSorting(lapTimes);
  const lapStats = useLapStatistics(lapTimes);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);

  const formatLapTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  };

  const formatGapTime = (ms: number): string => {
    const sign = ms < 0 ? '-' : '+';
    const absMs = Math.abs(ms);
    const seconds = Math.floor(absMs / 1000);
    const milliseconds = absMs % 1000;
    return `${sign}${seconds}.${String(milliseconds).padStart(3, '0')}`;
  };

  const getSourceColor = (source: string): string => {
    switch (source) {
      case 'speedhive':
        return 'bg-blue-100 text-blue-900';
      case 'race_monitor':
        return 'bg-purple-100 text-purple-900';
      case 'alpha_racehub':
        return 'bg-orange-100 text-orange-900';
      case 'manual':
        return 'bg-gray-100 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getSourceLabel = (source: string): string => {
    switch (source) {
      case 'speedhive':
        return 'Speedhive';
      case 'race_monitor':
        return 'Race Monitor';
      case 'alpha_racehub':
        return 'Alpha Racehub';
      case 'manual':
        return 'Manual';
      default:
        return source;
    }
  };

  // ========================================================================
  // Overview Tab
  // ========================================================================

  const OverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Summary Cards */}
      <View className="gap-3 mb-4">
        {/* Total Laps Card */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-xs text-muted mb-1">Total Laps</Text>
          <Text className="text-3xl font-bold text-foreground">
            {lapStats.totalLaps}
          </Text>
          <Text className="text-xs text-muted mt-1">
            {lapStats.validLaps} valid
          </Text>
        </View>

        {/* Best Lap Card */}
        {lapStats.bestLap > 0 && (
          <View className="bg-primary/10 rounded-lg p-4 border border-primary">
            <Text className="text-xs text-muted mb-1">Best Lap</Text>
            <Text className="text-3xl font-bold text-primary">
              {formatLapTime(lapStats.bestLap)}
            </Text>
          </View>
        )}

        {/* Average Lap Card */}
        {lapStats.averageLap > 0 && (
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Average Lap</Text>
            <Text className="text-2xl font-bold text-foreground">
              {formatLapTime(lapStats.averageLap)}
            </Text>
            <Text className="text-xs text-muted mt-1">
              +{formatGapTime(lapStats.averageLap - lapStats.bestLap)}
            </Text>
          </View>
        )}

        {/* Improvement Card */}
        {lapStats.improvementRate !== 0 && (
          <View
            className={cn(
              'rounded-lg p-4 border',
              lapStats.improvementRate > 0
                ? 'bg-success/10 border-success'
                : 'bg-error/10 border-error'
            )}
          >
            <Text className="text-xs text-muted mb-1">Improvement</Text>
            <Text
              className={cn(
                'text-2xl font-bold',
                lapStats.improvementRate > 0
                  ? 'text-success'
                  : 'text-error'
              )}
            >
              {lapStats.improvementRate > 0 ? '+' : ''}
              {lapStats.improvementRate.toFixed(2)}%
            </Text>
          </View>
        )}

        {/* Consistency Card */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-xs text-muted mb-1">Consistency</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{
                  width: `${Math.min(lapStats.consistencyScore, 100)}%`,
                }}
              />
            </View>
            <Text className="text-sm font-semibold text-foreground">
              {lapStats.consistencyScore.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Sessions Overview */}
      {sessions.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Sessions ({sessions.length})
          </Text>
          <View className="gap-2">
            {sessions.map((session) => {
              const sessionValidLaps = session.lapTimes.filter((l) => l.isValid);
              const bestLap = sessionValidLaps.length > 0
                ? Math.min(...sessionValidLaps.map((l) => l.lapTime))
                : 0;

              return (
                <TouchableOpacity
                  key={session.id}
                  onPress={() => {
                    setSelectedSession(session.id);
                    setViewMode('sessions');
                  }}
                  className="bg-surface rounded-lg p-3 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {session.eventName}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(session.eventDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        'px-2 py-1 rounded text-xs font-semibold',
                        getSourceColor(session.source)
                      )}
                    >
                      {getSourceLabel(session.source)}
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-muted">Best Lap</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {bestLap > 0 ? formatLapTime(bestLap) : 'N/A'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Laps</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {sessionValidLaps.length}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Track</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {session.trackName}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );

  // ========================================================================
  // Sessions Tab
  // ========================================================================

  const SessionsTab = () => {
    const filteredLaps = selectedSession
      ? lapTimes.filter((l) => l.eventId === selectedSession)
      : lapTimes;

    return (
      <View className="flex-1">
        {/* Sort Controls */}
        <View className="flex-row gap-2 mb-4 px-4">
          {(['speed', 'date', 'session'] as const).map((sort) => (
            <TouchableOpacity
              key={sort}
              onPress={() => setSortBy(sort)}
              className={cn(
                'px-3 py-2 rounded border',
                sortBy === sort
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-semibold',
                  sortBy === sort ? 'text-background' : 'text-foreground'
                )}
              >
                {sort === 'speed' ? 'Fastest' : sort === 'date' ? 'Recent' : 'Session'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lap Times List */}
        <FlatList
          data={sortedLaps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4 mb-2">
              <View className="bg-surface rounded-lg p-3 border border-border">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Lap {item.lapNumber}
                    </Text>
                    <Text className="text-xs text-muted">
                      {item.eventName} • {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      'px-2 py-1 rounded text-xs font-semibold',
                      getSourceColor(item.source)
                    )}
                  >
                    {getSourceLabel(item.source)}
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-primary">
                    {formatLapTime(item.lapTime)}
                  </Text>
                  <View className="flex-row gap-3">
                    {item.deltaToSessionBest !== undefined &&
                      item.deltaToSessionBest > 0 && (
                        <View>
                          <Text className="text-xs text-muted">Session Δ</Text>
                          <Text className="text-sm font-semibold text-foreground">
                            {formatGapTime(item.deltaToSessionBest)}
                          </Text>
                        </View>
                      )}
                    {item.position && (
                      <View>
                        <Text className="text-xs text-muted">Pos</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {item.position}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {item.notes && (
                  <Text className="text-xs text-muted mt-2 italic">
                    {item.notes}
                  </Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-muted text-center">
                No lap times available
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  // ========================================================================
  // Trends Tab
  // ========================================================================

  const TrendsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {stats && (
        <View className="gap-4">
          {/* Trend Direction */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-2">Performance Trend</Text>
            <View className="flex-row items-center gap-2">
              <View
                className={cn(
                  'w-3 h-3 rounded-full',
                  stats.trend.direction === 'improving'
                    ? 'bg-success'
                    : stats.trend.direction === 'declining'
                      ? 'bg-error'
                      : 'bg-warning'
                )}
              />
              <Text className="text-lg font-semibold text-foreground">
                {stats.trend.direction === 'improving'
                  ? '📈 Improving'
                  : stats.trend.direction === 'declining'
                    ? '📉 Declining'
                    : '➡️ Stable'}
              </Text>
            </View>
            <Text className="text-sm text-muted mt-2">
              {stats.trend.improvementRate > 0 ? '+' : ''}
              {stats.trend.improvementRate.toFixed(2)}% per session
            </Text>
          </View>

          {/* Consistency */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-2">Consistency Score</Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(stats.trend.consistencyScore, 100)}%`,
                  }}
                />
              </View>
              <Text className="text-lg font-bold text-primary">
                {stats.trend.consistencyScore.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Source Breakdown */}
          {stats.bySource.size > 0 && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">
                By Source
              </Text>
              <View className="gap-2">
                {Array.from(stats.bySource.entries()).map(([source, data]) => (
                  <View key={source} className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {getSourceLabel(source)}
                      </Text>
                      <Text className="text-xs text-muted">
                        {data.count} laps
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-bold text-primary">
                        {formatLapTime(data.bestLap)}
                      </Text>
                      <Text className="text-xs text-muted">
                        avg {formatLapTime(data.averageLap)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Session Breakdown */}
          {stats.bySessions.size > 0 && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">
                By Session
              </Text>
              <View className="gap-2">
                {Array.from(stats.bySessions.entries()).map(([sessionId, data]) => (
                  <View key={sessionId} className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {data.sessionName}
                      </Text>
                      <Text className="text-xs text-muted">
                        {data.count} laps
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-bold text-primary">
                        {formatLapTime(data.bestLap)}
                      </Text>
                      {data.improvement !== 0 && (
                        <Text
                          className={cn(
                            'text-xs',
                            data.improvement > 0 ? 'text-success' : 'text-error'
                          )}
                        >
                          {data.improvement > 0 ? '+' : ''}
                          {data.improvement.toFixed(2)}%
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  // ========================================================================
  // Comparison Tab
  // ========================================================================

  const ComparisonTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {stats && stats.bySource.size > 1 && (
        <View className="gap-4">
          <Text className="text-sm font-semibold text-foreground px-4">
            Platform Comparison
          </Text>
          {Array.from(stats.bySource.entries()).map(([source, data], index) => (
            <View key={source} className="px-4">
              <View className="bg-surface rounded-lg p-4 border border-border">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm font-semibold text-foreground">
                    {getSourceLabel(source)}
                  </Text>
                  <Text className="text-xs text-muted">{data.count} laps</Text>
                </View>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Best</Text>
                    <Text className="text-sm font-bold text-primary">
                      {formatLapTime(data.bestLap)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Average</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {formatLapTime(data.averageLap)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Worst</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {formatLapTime(data.worstLap)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // ========================================================================
  // Live Tab
  // ========================================================================

  const LiveTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-4">
        {/* Live Status */}
        <View className="bg-success/10 rounded-lg p-4 border border-success">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-3 h-3 bg-success rounded-full" />
            <Text className="text-sm font-semibold text-success">Live Tracking Ready</Text>
          </View>
          <Text className="text-xs text-muted">
            Connect to Speedhive or Race Monitor events to see live lap times. Data auto-refreshes every 5 seconds.
          </Text>
        </View>

        {/* Latest Lap Times */}
        {sessions.length > 0 && (
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground px-4">
              Latest Lap Times
            </Text>
            {sessions.map((session) => {
              const latestLap = session.lapTimes[session.lapTimes.length - 1];
              const validLaps = session.lapTimes.filter((l) => l.isValid);
              const bestLap = validLaps.length > 0
                ? Math.min(...validLaps.map((l) => l.lapTime))
                : 0;

              return (
                <View key={session.id} className="px-4">
                  <View className="bg-surface rounded-lg p-3 border border-border">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {session.eventName}
                        </Text>
                        <Text className="text-xs text-muted">
                          {new Date(session.eventDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View
                        className={cn(
                          'px-2 py-1 rounded text-xs font-semibold',
                          getSourceColor(session.source)
                        )}
                      >
                        {getSourceLabel(session.source)}
                      </View>
                    </View>

                    {latestLap && (
                      <View className="gap-2">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">Latest Lap</Text>
                          <Text className="text-lg font-bold text-primary">
                            {formatLapTime(latestLap.lapTime)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">Best Lap</Text>
                          <Text className="text-sm font-semibold text-foreground">
                            {bestLap > 0 ? formatLapTime(bestLap) : 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">Total Laps</Text>
                          <Text className="text-sm font-semibold text-foreground">
                            {validLaps.length}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Data Storage Info */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">📱 Data Storage</Text>
          <Text className="text-xs text-muted leading-relaxed mb-3">
            All lap times are automatically saved to your device's local storage (AsyncStorage). Data persists even after closing the app.
          </Text>
          <TouchableOpacity
            onPress={() => setShowStorageInfo(true)}
            className="p-2 bg-primary/10 rounded"
          >
            <Text className="text-xs font-semibold text-primary text-center">
              View Storage Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ========================================================================
  // Main Render
  // ========================================================================

  if (lapTimes.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg font-semibold text-foreground mb-2">
          No Lap Data
        </Text>
        <Text className="text-sm text-muted text-center">
          Link events from Speedhive, Race Monitor, or Alpha Racehub to see aggregated lap times.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Tab Navigation */}
      <View className="flex-row border-b border-border mb-4 overflow-x-auto">
        {(['overview', 'sessions', 'trends', 'comparison', 'live'] as const).map((tab) => (
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
                : tab === 'sessions'
                  ? 'Sessions'
                  : tab === 'trends'
                    ? 'Trends'
                  : tab === 'comparison'
                    ? 'Compare'
                    : '🔴 Live'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {viewMode === 'overview' && <OverviewTab />}
      {viewMode === 'sessions' && <SessionsTab />}
      {viewMode === 'trends' && <TrendsTab />}
      {viewMode === 'comparison' && <ComparisonTab />}
      {viewMode === 'live' && <LiveTab />}

      {/* Action Buttons */}
      <View className="flex-row gap-2 mt-4 pt-4 border-t border-border">
        <TouchableOpacity
          onPress={() => setShowExportModal(true)}
          className="flex-1 bg-primary rounded-lg p-3"
        >
          <Text className="text-center text-sm font-semibold text-background">
            Export
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowStorageInfo(true)}
          className="flex-1 bg-primary/10 rounded-lg p-3 border border-primary"
        >
          <Text className="text-center text-sm font-semibold text-primary">
            Storage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={clear}
          className="flex-1 bg-error/10 rounded-lg p-3 border border-error"
        >
          <Text className="text-center text-sm font-semibold text-error">
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Storage Info Modal */}
      <Modal visible={showStorageInfo} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface rounded-lg p-4 w-full max-w-sm gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Data Storage Information
            </Text>
            <View className="gap-2 bg-background rounded p-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Storage Type:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  AsyncStorage (Local)
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total Sessions:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {sessions.length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total Lap Times:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {lapTimes.length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Data Sources:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {stats?.sources.join(', ') || 'None'}
                </Text>
              </View>
            </View>
            <View className="bg-warning/10 rounded p-3 border border-warning">
              <Text className="text-xs text-warning font-semibold mb-1">
                ⚠️ Important
              </Text>
              <Text className="text-xs text-muted leading-relaxed">
                Data is stored locally on your device. Clearing app data or uninstalling will delete all saved lap times. Regularly export your data for backup.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowStorageInfo(false)}
              className="bg-primary rounded-lg p-3"
            >
              <Text className="text-center text-sm font-semibold text-background">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal visible={showExportModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface rounded-lg p-4 w-full max-w-sm gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Export Data
            </Text>
            <TouchableOpacity className="bg-primary rounded-lg p-3">
              <Text className="text-center text-sm font-semibold text-background">
                Export as JSON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary rounded-lg p-3">
              <Text className="text-center text-sm font-semibold text-background">
                Export as CSV
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowExportModal(false)}
              className="bg-border rounded-lg p-3"
            >
              <Text className="text-center text-sm font-semibold text-foreground">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
