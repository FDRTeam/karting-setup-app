import { ScrollView, Text, View, TextInput, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SelectPicker } from "@/components/select-picker";
import { useSession } from "@/lib/session-context";
import { useUnits } from "@/lib/units-context";
import { USA_KART_TRACKS, type KartTrack } from "@/lib/data/tracks";
import { fetchWeather, fetchThingSpeakTrackTemp, type WeatherData } from "@/lib/services/weather";
import { useRouter } from "expo-router";
import { useAsphaltTemperature } from "@/hooks/use-asphalt-temperature";

const TRACK_LAYOUTS = ["Lawson", "National", "Coyote"];

/**
 * Convert wind direction degrees to compass direction label
 * 0° = N, 90° = E, 180° = S, 270° = W
 */
function getWindDirectionLabel(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export default function WeatherScreen() {
  const router = useRouter();
  const { currentSession, updateCurrentSession } = useSession();
  const { units, convertTemperature, formatTemperature } = useUnits();

  const [selectedTrack, setSelectedTrack] = useState<KartTrack | null>(null);
  const [trackSearchText, setTrackSearchText] = useState("");
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackAsphaltTemp, setTrackAsphaltTemp] = useState("");
  const [trackCoordinates, setTrackCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [kartNumber, setKartNumber] = useState("");
  const [trackLayout, setTrackLayout] = useState("National");

  const asphaltTemp = useAsphaltTemperature({
    trackName: selectedTrack?.name,
    autoRefresh: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Update manual input when sensor data changes
  useEffect(() => {
    if (asphaltTemp.temperature && !trackAsphaltTemp && asphaltTemp.average) {
      setTrackAsphaltTemp(asphaltTemp.average.toFixed(1));
    }
  }, [asphaltTemp.temperature, asphaltTemp.average, trackAsphaltTemp]);

  // Filter tracks based on search
  const filteredTracks = USA_KART_TRACKS.filter(
    (track) =>
      track.name.toLowerCase().includes(trackSearchText.toLowerCase()) ||
      track.city.toLowerCase().includes(trackSearchText.toLowerCase()) ||
      track.state.toLowerCase().includes(trackSearchText.toLowerCase())
  );

  // Fetch weather when track is selected
  useEffect(() => {
    if (selectedTrack) {
      setTrackCoordinates({ latitude: selectedTrack.latitude, longitude: selectedTrack.longitude });
      fetchWeatherForTrack(selectedTrack);
    }
  }, [selectedTrack]);

  const fetchWeatherForTrack = async (track: KartTrack) => {
    setLoading(true);
    setError(null);
    try {
      const weatherData = await fetchWeather(track.latitude, track.longitude);
      
      // If track has ThingSpeak configuration, fetch real track temperature
      if (track.thingspeak) {
        const thingSpeakTemp = await fetchThingSpeakTrackTemp(
          track.thingspeak.channelId,
          track.thingspeak.readApiKey
        );
        if (thingSpeakTemp !== null) {
          // Use actual track temperature from ThingSpeak instead of estimated
          weatherData.trackAsphaltTemp = thingSpeakTemp;
          setTrackAsphaltTemp(thingSpeakTemp.toFixed(1));
        }
      }
      
      setWeather(weatherData);
      setTrackCoordinates({ latitude: track.latitude, longitude: track.longitude });
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedTrack || !weather) {
      setError("Please select a track and wait for weather data");
      return;
    }

    if (!kartNumber.trim()) {
      setError("Please enter a kart number");
      return;
    }

    // Convert weather temperature to user's preferred unit
    const tempInUserUnit = convertTemperature(weather.temperature, "C", units.temperature);
    const asphaltTempValue = trackAsphaltTemp ? parseFloat(trackAsphaltTemp) : tempInUserUnit + (units.temperature === "F" ? 10 : 5.5);
    const asphaltTempInUserUnit = convertTemperature(asphaltTempValue, units.temperature === "F" ? "F" : "C", units.temperature);

    await updateCurrentSession({
      kartNumber: kartNumber.trim(),
      trackName: `${selectedTrack.name} - ${selectedTrack.city}, ${selectedTrack.state}`,
      trackLayout: trackLayout,
      trackLocation: {
        latitude: selectedTrack.latitude,
        longitude: selectedTrack.longitude,
      },
      weather: {
        temperature: tempInUserUnit,
        trackAsphaltTemp: asphaltTempInUserUnit,
        conditions: weather.conditions,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        timestamp: weather.timestamp,
        sensorFocused: asphaltTemp.temperature?.focused,
        sensorWide: asphaltTemp.temperature?.wide,
      },
    });

    router.push("/(tabs)/tires");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Track & Weather</Text>
            <Text className="text-sm text-muted">Select your track and check conditions</Text>
          </View>

          {/* Kart Number */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Kart Number</Text>
            <TextInput
              placeholder="e.g., 42"
              placeholderTextColor="#9BA1A6"
              value={kartNumber}
              onChangeText={setKartNumber}
              className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
            />
          </View>

          {/* Track Selection */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Select Track</Text>

            {selectedTrack ? (
              <View className="bg-primary/10 border border-primary rounded-lg p-3">
                <Text className="font-semibold text-foreground">{selectedTrack.name}</Text>
                <Text className="text-sm text-muted">
                  {selectedTrack.city}, {selectedTrack.state}
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-muted">No track selected</Text>
            )}

            <TouchableOpacity
              onPress={() => setShowTrackPicker(true)}
              className="bg-primary px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">
                {selectedTrack ? "Change Track" : "Select Track"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Track Layout */}
          {selectedTrack && (
            <View className="gap-3 bg-surface rounded-2xl p-4">
              <Text className="text-sm font-semibold text-foreground">Track Layout</Text>
              <SelectPicker
                options={TRACK_LAYOUTS}
                selectedValue={trackLayout}
                onValueChange={setTrackLayout}
                label="Select Track Layout"
              />
            </View>
          )}

          {/* Weather Data */}
          {loading && (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#0a7ea4" />
              <Text className="text-muted mt-2">Fetching weather data...</Text>
            </View>
          )}

          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {weather && !loading && (
            <View className="gap-3 bg-surface rounded-2xl p-4">
              <Text className="text-sm font-semibold text-foreground">Current Conditions</Text>

              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-muted">Temperature</Text>
                  <Text className="text-foreground font-semibold">
                    {formatTemperature(convertTemperature(weather.temperature, "C", units.temperature))}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-muted">Conditions</Text>
                  <Text className="text-foreground font-semibold">{weather.conditions}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-muted">Humidity</Text>
                  <Text className="text-foreground font-semibold">{weather.humidity}%</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-muted">Wind Speed</Text>
                  <Text className="text-foreground font-semibold">
                    {weather.windSpeed.toFixed(1)} {units.speed}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-muted">Wind Direction</Text>
                  <Text className="text-foreground font-semibold">
                    {weather.windDirection.toFixed(0)}° {getWindDirectionLabel(weather.windDirection)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Track Asphalt Temperature */}
          {weather && !loading && (
            <View className="gap-3 bg-surface rounded-2xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-foreground">Track Asphalt Temperature</Text>
                {asphaltTemp.loading && (
                  <Text className="text-xs text-muted">Loading sensor...</Text>
                )}
              </View>

              {/* Live Sensor Data */}
              {asphaltTemp.temperature && !asphaltTemp.error && (
                <View className="gap-2 mb-2">
                  {/* Focused Temperature */}
                  <View className="bg-primary/10 border border-primary rounded-lg p-3">
                    <Text className="text-xs text-muted mb-1">Focused Sensor</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-2xl font-bold text-primary">{asphaltTemp.temperature.focused.toFixed(1)}°</Text>
                      <Text className="text-xs text-muted">High precision</Text>
                    </View>
                  </View>

                  {/* Wide Temperature */}
                  <View className="bg-surface border border-border rounded-lg p-3">
                    <Text className="text-xs text-muted mb-1">Wide Sensor</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-semibold text-foreground">{asphaltTemp.temperature.wide.toFixed(1)}°</Text>
                      <Text className="text-xs text-muted">Area average</Text>
                    </View>
                  </View>

                  {/* Average */}
                  {asphaltTemp.average && (
                    <View className="bg-surface border border-border rounded-lg p-3">
                      <Text className="text-xs text-muted mb-1">Average</Text>
                      <Text className="text-lg font-semibold text-foreground">{asphaltTemp.average.toFixed(1)}°</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Manual Input */}
              <TextInput
                placeholder="Enter track temperature (°C)"
                placeholderTextColor="#9BA1A6"
                value={trackAsphaltTemp}
                onChangeText={setTrackAsphaltTemp}
                keyboardType="decimal-pad"
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />

              {asphaltTemp.error && (
                <Text className="text-xs text-error">{asphaltTemp.error}</Text>
              )}
            </View>
          )}

          {/* Continue Button */}
          {weather && !loading && (
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-primary px-4 py-3 rounded-lg items-center mt-4"
            >
              <Text className="text-background font-semibold">Continue to Tire Setup</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Track Picker Modal */}
      <Modal
        visible={showTrackPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTrackPicker(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-background rounded-t-3xl mt-12">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Select a Track</Text>
              <TouchableOpacity onPress={() => setShowTrackPicker(false)}>
                <Text className="text-primary text-lg font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 py-3">
              <TextInput
                placeholder="Search tracks..."
                placeholderTextColor="#9BA1A6"
                value={trackSearchText}
                onChangeText={setTrackSearchText}
                className="bg-surface text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>

            {/* Track List */}
            <FlatList
              data={filteredTracks}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTrack(item);
                    setShowTrackPicker(false);
                  }}
                  className="px-4 py-3 border-b border-border"
                >
                  <Text className="text-foreground font-semibold">{item.name}</Text>
                  <Text className="text-sm text-muted">
                    {item.city}, {item.state}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
