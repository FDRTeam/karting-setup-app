import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { KartingSession } from "@/lib/types";
import { useCloudSync } from "@/lib/contexts/cloud-sync-context";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function HistoryScreen() {
  const { sessions, loadSessions, deleteSession, isSyncing, syncError, syncToCloud, syncFromCloud } = useCloudSync();
  const [selectedSession, setSelectedSession] = useState<KartingSession | null>(null);

  // Reload sessions when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Session", "Are you sure you want to delete this setup?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteSession(id);
          setSelectedSession(null);
        },
        style: "destructive",
      },
    ]);
  };

  const handleSyncToCloud = async () => {
    try {
      await syncToCloud();
      Alert.alert("Success", "All setups synced to cloud!");
    } catch (error) {
      Alert.alert("Error", "Failed to sync to cloud");
    }
  };

  const handleSyncFromCloud = async () => {
    try {
      await syncFromCloud();
      Alert.alert("Success", "Setups synced from cloud!");
    } catch (error) {
      Alert.alert("Error", "Failed to sync from cloud");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatLapTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${minutes}:${String(parseFloat(secs)).padStart(5, '0')}`;
  };

  const getWeatherSummary = (weather: any): string => {
    if (!weather) return "N/A";
    return `${weather.temperature.toFixed(0)}°C, ${weather.conditions}`;
  };

  if (selectedSession) {
    return (
      <ScreenContainer className="p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="gap-4">
            {/* Back Button */}
            <TouchableOpacity onPress={() => setSelectedSession(null)}>
              <Text className="text-primary font-semibold">← Back to Sessions</Text>
            </TouchableOpacity>

            {/* Session Header */}
            <View className="gap-2 bg-surface rounded-2xl p-4">
              <Text className="text-2xl font-bold text-foreground">
                {selectedSession.trackName}
              </Text>
              <Text className="text-sm text-muted">{formatDate(selectedSession.date)}</Text>
              {selectedSession.syncedAt && (
                <Text className="text-xs text-muted">
                  Synced: {formatDate(selectedSession.syncedAt)}
                </Text>
              )}
            </View>

            {/* Weather */}
            <View className="bg-surface rounded-2xl p-4 gap-2">
              <Text className="text-lg font-semibold text-foreground">Weather</Text>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-muted">Temperature</Text>
                  <Text className="text-foreground font-semibold">
                    {selectedSession.weather?.temperature.toFixed(1)}°C
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Track Temp</Text>
                  <Text className="text-foreground font-semibold">
                    {selectedSession.weather?.trackAsphaltTemp.toFixed(1)}°C
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Humidity</Text>
                  <Text className="text-foreground font-semibold">
                    {selectedSession.weather?.humidity}%
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Wind Speed</Text>
                  <Text className="text-foreground font-semibold">
                    {selectedSession.weather?.windSpeed.toFixed(1)} km/h
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Wind Direction</Text>
                  <Text className="text-foreground font-semibold">
                    {selectedSession.weather?.windDirection}°
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Conditions</Text>
                  <Text className="text-foreground font-semibold">
                    {selectedSession.weather?.conditions}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tire Setup */}
            {selectedSession.tireSetup && (
              <View className="bg-surface rounded-2xl p-4 gap-2">
                <Text className="text-lg font-semibold text-foreground">Tire Setup</Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Type</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.tireSetup.type}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">FL Pressure</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.tireSetup.pressureFrontLeft} PSI
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">FR Pressure</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.tireSetup.pressureFrontRight} PSI
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">RL Pressure</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.tireSetup.pressureRearLeft} PSI
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">RR Pressure</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.tireSetup.pressureRearRight} PSI
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Rim Brand</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.tireSetup.rimBrand || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Chassis Setup */}
            {selectedSession.chassisSetup && (
              <View className="bg-surface rounded-2xl p-4 gap-2">
                <Text className="text-lg font-semibold text-foreground">Chassis Setup</Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Type</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.chassisSetup.type}
                    </Text>
                  </View>
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-foreground">Front Left</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Caster</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.chassisSetup.frontLeft.caster}°
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Camber</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.chassisSetup.frontLeft.camber}°
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Toe</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.chassisSetup.frontLeft.toe}°
                      </Text>
                    </View>
                  </View>
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-foreground">Front Right</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Caster</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.chassisSetup.frontRight.caster}°
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Camber</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.chassisSetup.frontRight.camber}°
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Toe</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.chassisSetup.frontRight.toe}°
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Engine Setup */}
            {selectedSession.engineSetup && (
              <View className="bg-surface rounded-2xl p-4 gap-2">
                <Text className="text-lg font-semibold text-foreground">Engine</Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Type</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.engineSetup.type}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Serial</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.engineSetup.serialNumber || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Spark Plug</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.engineSetup.sparkPlug || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Last Spark Plug Change</Text>
                    <Text className="text-foreground font-semibold text-right flex-1">
                      {selectedSession.engineSetup.lastSparkPlugChangeDate
                        ? new Date(selectedSession.engineSetup.lastSparkPlugChangeDate).toLocaleDateString() +
                          (selectedSession.engineSetup.lastSparkPlugChangeTime
                            ? " " +
                              (() => {
                                const [h, m] = selectedSession.engineSetup.lastSparkPlugChangeTime!.split(":");
                                const hour12 = parseInt(h) % 12 || 12;
                                const p = parseInt(h) >= 12 ? "PM" : "AM";
                                return `${String(hour12).padStart(2, "0")}:${m} ${p}`;
                              })()
                            : "")
                        : "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Last Oil Change</Text>
                    <Text className="text-foreground font-semibold text-right flex-1">
                      {selectedSession.engineSetup.lastOilChangeDate
                        ? new Date(selectedSession.engineSetup.lastOilChangeDate).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Weight Distribution */}
            {selectedSession.weightDistribution && (
              <View className="bg-surface rounded-2xl p-4 gap-2">
                <Text className="text-lg font-semibold text-foreground">Weight Distribution</Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Total Weight</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.weightDistribution.totalWeight} kg
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Cross Weight</Text>
                    <Text className="text-foreground font-semibold">
                      {selectedSession.weightDistribution.crossWeightPercentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Performance Metrics */}
            {(selectedSession.bestLapTime || selectedSession.averageLapTime || selectedSession.lapCount) && (
              <View className="bg-surface rounded-2xl p-4 gap-2">
                <Text className="text-lg font-semibold text-foreground">Performance</Text>
                <View className="gap-1">
                  {selectedSession.bestLapTime && (
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Best Lap Time</Text>
                      <Text className="text-foreground font-semibold">
                        {formatLapTime(selectedSession.bestLapTime)}
                      </Text>
                    </View>
                  )}
                  {selectedSession.averageLapTime && (
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Average Lap Time</Text>
                      <Text className="text-foreground font-semibold">
                        {formatLapTime(selectedSession.averageLapTime)}
                      </Text>
                    </View>
                  )}
                  {selectedSession.lapCount && (
                    <View className="flex-row justify-between">
                      <Text className="text-muted">Total Laps</Text>
                      <Text className="text-foreground font-semibold">
                        {selectedSession.lapCount}
                      </Text>
                    </View>
                  )}
                  {selectedSession.performanceNotes && (
                    <View className="mt-2">
                      <Text className="text-muted text-sm">Notes</Text>
                      <Text className="text-foreground text-sm mt-1">
                        {selectedSession.performanceNotes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => handleDelete(selectedSession.id)}
              className="bg-error px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">Delete Setup</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header */}
        <View className="gap-2 mb-4">
          <Text className="text-3xl font-bold text-foreground">Setup History</Text>
          <Text className="text-sm text-muted">Your saved karting setups</Text>
        </View>

        {/* Sync Status */}
        {syncError && (
          <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-sm">{syncError}</Text>
          </View>
        )}

        {/* Sync Buttons */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={handleSyncToCloud}
            disabled={isSyncing}
            className="flex-1 bg-primary px-3 py-2 rounded-lg items-center"
          >
            {isSyncing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-background font-semibold text-sm">Sync to Cloud</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSyncFromCloud}
            disabled={isSyncing}
            className="flex-1 bg-primary px-3 py-2 rounded-lg items-center"
          >
            {isSyncing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-background font-semibold text-sm">Sync from Cloud</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-center">
              No setups saved yet. Create a new setup to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedSession(item)}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="gap-2">
                  <Text className="text-lg font-semibold text-foreground">
                    {item.trackName}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
                    <View className="flex-row gap-2 items-center">
                      {item.weather && (
                        <Text className="text-xs text-muted">
                          {item.weather.temperature.toFixed(0)}°C
                        </Text>
                      )}
                      {item.tireSetup && (
                        <Text className="text-xs text-muted">{item.tireSetup.type}</Text>
                      )}
                      {item.bestLapTime && (
                        <Text className="text-xs text-success font-semibold">
                          {formatLapTime(item.bestLapTime)}
                        </Text>
                      )}
                      {item.cloudId && (
                        <Text className="text-xs text-success">☁️</Text>
                      )}
                    </View>
                  </View>
                  {item.weather && (
                    <Text className="text-xs text-muted">
                      {getWeatherSummary(item.weather)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
