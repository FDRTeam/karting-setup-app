import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { cn } from '@/lib/utils';
import { ScreenContainer } from './screen-container';
import {
  getAllTimingPlatforms,
  getTimingPlatformConfig,
  type TimingPlatformType,
  type TimingPlatformConfig,
} from '@/lib/services/timing-platform-registry';

interface TimingPlatformSelectorProps {
  onConnect: (platformId: TimingPlatformType, credentials: Record<string, string>) => Promise<boolean>;
  isConnecting: boolean;
  error: string | null;
  selectedPlatform: TimingPlatformType | null;
  onDisconnect: () => Promise<void>;
}

/**
 * Timing Platform Selector Component
 */
export function TimingPlatformSelector({
  onConnect,
  isConnecting,
  error,
  selectedPlatform,
  onDisconnect,
}: TimingPlatformSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedForSetup, setSelectedForSetup] = useState<TimingPlatformType | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const platforms = getAllTimingPlatforms();
  const currentPlatform = selectedPlatform ? getTimingPlatformConfig(selectedPlatform) : null;

  const handleSelectPlatform = (platformId: TimingPlatformType) => {
    const platform = getTimingPlatformConfig(platformId);
    if (platform) {
      setSelectedForSetup(platformId);
      setCredentials({});
      platform.authFields.forEach((field) => {
        setCredentials((prev) => ({ ...prev, [field.key]: '' }));
      });
    }
  };

  const handleConnect = async () => {
    if (!selectedForSetup) return;

    const success = await onConnect(selectedForSetup, credentials);
    if (success) {
      setShowModal(false);
      setSelectedForSetup(null);
      setCredentials({});
    }
  };

  const handleDisconnect = async () => {
    await onDisconnect();
  };

  // ========================================================================
  // Connected State
  // ========================================================================

  if (selectedPlatform && currentPlatform) {
    return (
      <View className="bg-surface rounded-lg p-4 border border-border gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-2xl">{currentPlatform.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">
                {currentPlatform.name}
              </Text>
              <Text className="text-xs text-success">● Connected</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleDisconnect}
            className="px-3 py-2 bg-error/10 rounded-lg border border-error"
          >
            <Text className="text-xs font-semibold text-error">Disconnect</Text>
          </TouchableOpacity>
        </View>

        {currentPlatform.supportsLiveTracking && (
          <View className="bg-primary/10 rounded p-2 border border-primary">
            <Text className="text-xs text-primary font-semibold">
              ✓ Live tracking enabled
            </Text>
          </View>
        )}
      </View>
    );
  }

  // ========================================================================
  // Platform Selection
  // ========================================================================

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-foreground">
        Select Timing Platform
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="gap-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            onPress={() => handleSelectPlatform(platform.id)}
            className="bg-surface rounded-lg p-3 border border-border min-w-[140px]"
          >
            <Text className="text-2xl mb-2">{platform.icon}</Text>
            <Text className="text-xs font-semibold text-foreground mb-1">
              {platform.name}
            </Text>
            <Text className="text-xs text-muted leading-tight">
              {platform.description}
            </Text>
            {platform.supportsLiveTracking && (
              <View className="mt-2 flex-row items-center gap-1">
                <Text className="text-xs text-success">● Live</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal for credentials */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface rounded-lg p-4 w-full max-w-sm gap-4">
            {selectedForSetup && (
              <>
                <View>
                  <Text className="text-lg font-semibold text-foreground mb-1">
                    Connect to{' '}
                    {getTimingPlatformConfig(selectedForSetup)?.name}
                  </Text>
                  <Text className="text-xs text-muted">
                    {getTimingPlatformConfig(selectedForSetup)?.description}
                  </Text>
                </View>

                {/* Credential Fields */}
                <View className="gap-3">
                  {getTimingPlatformConfig(selectedForSetup)?.authFields.map(
                    (field) => (
                      <View key={field.key} className="gap-1">
                        <Text className="text-xs font-semibold text-foreground">
                          {field.label}
                          {field.required && (
                            <Text className="text-error">*</Text>
                          )}
                        </Text>
                        <TextInput
                          placeholder={field.placeholder}
                          secureTextEntry={field.type === 'password'}
                          value={credentials[field.key] || ''}
                          onChangeText={(text) =>
                            setCredentials((prev) => ({
                              ...prev,
                              [field.key]: text,
                            }))
                          }
                          className="bg-background border border-border rounded-lg p-3 text-sm text-foreground"
                          placeholderTextColor="#9BA1A6"
                        />
                        {field.hint && (
                          <Text className="text-xs text-muted">
                            {field.hint}
                          </Text>
                        )}
                      </View>
                    )
                  )}
                </View>

                {/* Error Message */}
                {error && (
                  <View className="bg-error/10 border border-error rounded-lg p-3">
                    <Text className="text-xs text-error">{error}</Text>
                  </View>
                )}

                {/* Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      setSelectedForSetup(null);
                    }}
                    className="flex-1 bg-muted/20 rounded-lg p-3"
                  >
                    <Text className="text-center text-sm font-semibold text-foreground">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConnect}
                    disabled={isConnecting}
                    className={cn(
                      'flex-1 rounded-lg p-3 flex-row items-center justify-center gap-2',
                      isConnecting
                        ? 'bg-primary/50'
                        : 'bg-primary'
                    )}
                  >
                    {isConnecting && (
                      <ActivityIndicator color="#ffffff" size="small" />
                    )}
                    <Text className="text-center text-sm font-semibold text-background">
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Trigger button */}
      {selectedForSetup && !showModal && (
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-primary rounded-lg p-3"
        >
          <Text className="text-center text-sm font-semibold text-background">
            Setup {getTimingPlatformConfig(selectedForSetup)?.name}
          </Text>
        </TouchableOpacity>
      )}

      {!selectedForSetup && (
        <TouchableOpacity
          onPress={() => {
            setSelectedForSetup(platforms[0].id);
            setShowModal(true);
          }}
          className="bg-primary rounded-lg p-3"
        >
          <Text className="text-center text-sm font-semibold text-background">
            Select a Platform
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Live Timing Display Component
 */
interface LiveTimingDisplayProps {
  eventData: any; // LiveEventData
  participantLapTimes: any[]; // LiveLapData[]
  loading: boolean;
  error: string | null;
}

export function LiveTimingDisplay({
  eventData,
  participantLapTimes,
  loading,
  error,
}: LiveTimingDisplayProps) {
  if (loading) {
    return (
      <View className="items-center justify-center p-4">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="text-muted mt-2">Loading live timing...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-error/10 border border-error rounded-lg p-4">
        <Text className="text-sm font-semibold text-error mb-1">
          Error Loading Timing
        </Text>
        <Text className="text-xs text-error">{error}</Text>
      </View>
    );
  }

  if (!eventData) {
    return (
      <View className="items-center justify-center p-4">
        <Text className="text-muted">No event data available</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {/* Event Header */}
      <View className="bg-surface rounded-lg p-4 border border-border">
        <Text className="text-sm font-semibold text-foreground mb-2">
          {eventData.eventName}
        </Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-muted">Track</Text>
            <Text className="text-sm font-semibold text-foreground">
              {eventData.trackName}
            </Text>
          </View>
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
            <Text className="text-xs text-muted">Lap</Text>
            <Text className="text-sm font-semibold text-foreground">
              {eventData.currentLap}/{eventData.totalLaps || '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Participant Lap Times */}
      {participantLapTimes.length > 0 && (
        <View className="gap-2">
          <Text className="text-xs font-semibold text-muted px-1">
            Recent Laps
          </Text>
          {participantLapTimes.slice(-5).map((lap, index) => (
            <View
              key={index}
              className={cn(
                'flex-row justify-between items-center p-3 rounded-lg border',
                lap.isValid
                  ? 'bg-success/5 border-success'
                  : 'bg-error/5 border-error'
              )}
            >
              <View>
                <Text className="text-xs text-muted">Lap {lap.lapNumber}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatLapTime(lap.lapTime)}
                </Text>
              </View>
              {!lap.isValid && (
                <Text className="text-xs text-error font-semibold">
                  Invalid
                </Text>
              )}
              {lap.sector1 && (
                <View className="items-end">
                  <Text className="text-xs text-muted">
                    S1: {formatLapTime(lap.sector1)}
                  </Text>
                  <Text className="text-xs text-muted">
                    S2: {formatLapTime(lap.sector2 || 0)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Format lap time for display
 */
function formatLapTime(ms: number): string {
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
