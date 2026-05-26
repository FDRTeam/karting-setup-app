import { ScrollView, Text, View, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useSession } from "@/lib/session-context";
import { useRouter } from "expo-router";
import type { GearingSetup } from "@/lib/types";

export default function GearingScreen() {
  const router = useRouter();
  const { currentSession, updateCurrentSession } = useSession();
  const [frontDriver, setFrontDriver] = useState<string>("");
  const [rearSprocket, setRearSprocket] = useState<string>("");
  const [ratio, setRatio] = useState<string>("");

  // Load existing gearing data
  useEffect(() => {
    if (currentSession?.gearingSetup) {
      setFrontDriver(currentSession.gearingSetup.frontDriver?.toString() || "");
      setRearSprocket(currentSession.gearingSetup.rearSprocket?.toString() || "");
      calculateRatio(
        currentSession.gearingSetup.frontDriver,
        currentSession.gearingSetup.rearSprocket
      );
    }
  }, [currentSession?.gearingSetup]);

  const calculateRatio = (front: number, rear: number) => {
    if (front > 0 && rear > 0) {
      const calculatedRatio = (rear / front).toFixed(3);
      setRatio(calculatedRatio);
    } else {
      setRatio("");
    }
  };

  const handleFrontDriverChange = (value: string) => {
    setFrontDriver(value);
    const front = parseFloat(value);
    const rear = parseFloat(rearSprocket);
    if (front > 0 && rear > 0) {
      calculateRatio(front, rear);
    }
  };

  const handleRearSprocketChange = (value: string) => {
    setRearSprocket(value);
    const front = parseFloat(frontDriver);
    const rear = parseFloat(value);
    if (front > 0 && rear > 0) {
      calculateRatio(front, rear);
    }
  };

  const calculateAdjustedRatio = (front: number, rear: number) => {
    if (front > 0 && rear > 0) {
      return (rear / front).toFixed(3);
    }
    return "—";
  };

  const handleSave = async () => {
    const front = parseFloat(frontDriver);
    const rear = parseFloat(rearSprocket);

    if (front > 0 && rear > 0) {
      const gearingSetup: GearingSetup = {
        frontDriver: front,
        rearSprocket: rear,
        ratio: rear / front,
      };

      await updateCurrentSession({ gearingSetup });
    }
  };

  const handleContinue = async () => {
    await handleSave();
    router.push("/(tabs)/weight");
  };

  useEffect(() => {
    handleSave();
  }, [frontDriver, rearSprocket]);

  const front = parseFloat(frontDriver) || 0;
  const rear = parseFloat(rearSprocket) || 0;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-20">
          {/* Header with Back Button */}
          <View className="gap-2">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
              <Text className="text-2xl text-primary mb-2">‹ Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Gearing</Text>
            <Text className="text-sm text-muted">Configure front driver and rear sprocket</Text>
          </View>

          {/* Front Driver Section - Side by Side */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Front Driver</Text>
            <View className="flex-row items-center justify-center gap-3">
              {/* -1 Adjustment Box (Left) */}
              {front > 1 && (
                <View className="flex-1 bg-surface rounded-lg p-2 border border-border items-center">
                  <Text className="text-xs text-muted">-1</Text>
                  <Text className="text-sm font-bold text-primary">{front - 1}</Text>
                  <Text className="text-xs text-primary font-semibold">
                    {calculateAdjustedRatio(front - 1, rear)}
                  </Text>
                </View>
              )}

              {/* Main Input (Center) */}
              <View className="flex-1">
                <TextInput
                  value={frontDriver}
                  onChangeText={handleFrontDriverChange}
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                  keyboardType="decimal-pad"
                  className="border border-border rounded-lg px-3 py-2 text-base text-foreground bg-background text-center"
                />
              </View>

              {/* +1 Adjustment Box (Right) */}
              {front > 0 && (
                <View className="flex-1 bg-surface rounded-lg p-2 border border-border items-center">
                  <Text className="text-xs text-muted">+1</Text>
                  <Text className="text-sm font-bold text-primary">{front + 1}</Text>
                  <Text className="text-xs text-primary font-semibold">
                    {calculateAdjustedRatio(front + 1, rear)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Rear Sprocket Section - Side by Side */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Rear Sprocket</Text>
            <View className="flex-row items-center justify-center gap-3">
              {/* -1 Adjustment Box (Left) */}
              {rear > 1 && (
                <View className="flex-1 bg-surface rounded-lg p-2 border border-border items-center">
                  <Text className="text-xs text-muted">-1</Text>
                  <Text className="text-sm font-bold text-primary">{rear - 1}</Text>
                  <Text className="text-xs text-primary font-semibold">
                    {calculateAdjustedRatio(front, rear - 1)}
                  </Text>
                </View>
              )}

              {/* Main Input (Center) */}
              <View className="flex-1">
                <TextInput
                  value={rearSprocket}
                  onChangeText={handleRearSprocketChange}
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                  keyboardType="decimal-pad"
                  className="border border-border rounded-lg px-3 py-2 text-base text-foreground bg-background text-center"
                />
              </View>

              {/* +1 Adjustment Box (Right) */}
              {rear > 0 && (
                <View className="flex-1 bg-surface rounded-lg p-2 border border-border items-center">
                  <Text className="text-xs text-muted">+1</Text>
                  <Text className="text-sm font-bold text-primary">{rear + 1}</Text>
                  <Text className="text-xs text-primary font-semibold">
                    {calculateAdjustedRatio(front, rear + 1)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Current Gear Ratio Display */}
          <View className="gap-2 bg-surface rounded-2xl p-4 border border-border items-center">
            <Text className="text-sm font-semibold text-foreground">Current Gear Ratio</Text>
            <Text className="text-4xl font-bold text-primary">
              {ratio || "—"}
            </Text>
            <Text className="text-xs text-muted">
              {frontDriver && rearSprocket
                ? `${rearSprocket} ÷ ${frontDriver}`
                : "Enter values to calculate"}
            </Text>
          </View>

          {/* Info Card */}
          <View className="gap-2 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs font-semibold text-foreground">How it works</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Higher ratio = more acceleration. Lower ratio = higher top speed. Compare ratios instantly with ±1 tooth adjustments.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-success px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">Continue to Weight Distribution</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
