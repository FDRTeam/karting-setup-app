import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useUnits, type SpeedUnit, type TemperatureUnit, type DistanceUnit } from "@/lib/units-context";

export default function SettingsScreen() {
  const { units, setUnits } = useUnits();

  const speedUnits: SpeedUnit[] = ["mph", "kmh"];
  const tempUnits: TemperatureUnit[] = ["F", "C"];
  const distanceUnits: DistanceUnit[] = ["inches", "mm"];

  const handleSpeedChange = async (unit: SpeedUnit) => {
    await setUnits({ ...units, speed: unit });
  };

  const handleTempChange = async (unit: TemperatureUnit) => {
    await setUnits({ ...units, temperature: unit });
  };

  const handleDistanceChange = async (unit: DistanceUnit) => {
    await setUnits({ ...units, distance: unit });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted">Customize your measurement units</Text>
          </View>

          {/* Speed Unit */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Speed Unit</Text>
            <Text className="text-xs text-muted mb-2">Current: {units.speed}</Text>
            <View className="gap-2">
              {speedUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => handleSpeedChange(unit)}
                  className={`p-3 rounded-lg border ${
                    units.speed === unit
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      units.speed === unit ? "text-background" : "text-foreground"
                    }`}
                  >
                    {unit === "mph" ? "Miles per Hour (mph)" : "Kilometers per Hour (km/h)"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Temperature Unit */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Temperature Unit</Text>
            <Text className="text-xs text-muted mb-2">Current: °{units.temperature}</Text>
            <View className="gap-2">
              {tempUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => handleTempChange(unit)}
                  className={`p-3 rounded-lg border ${
                    units.temperature === unit
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      units.temperature === unit ? "text-background" : "text-foreground"
                    }`}
                  >
                    {unit === "F" ? "Fahrenheit (°F)" : "Celsius (°C)"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Unit */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Distance Unit</Text>
            <Text className="text-xs text-muted mb-2">Current: {units.distance}</Text>
            <View className="gap-2">
              {distanceUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => handleDistanceChange(unit)}
                  className={`p-3 rounded-lg border ${
                    units.distance === unit
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      units.distance === unit ? "text-background" : "text-foreground"
                    }`}
                  >
                    {unit === "inches" ? "Inches (in)" : "Millimeters (mm)"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4">
            <Text className="text-sm text-foreground leading-relaxed">
              Your unit preferences will be applied throughout the app. All measurements will be
              displayed and input in your selected units.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
