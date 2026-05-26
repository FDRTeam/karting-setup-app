import { ScrollView, Text, View, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useSession } from "@/lib/session-context";
import type { WeightDistribution } from "@/lib/types";
import { useRouter } from "expo-router";
import { useCloudSync } from "@/lib/contexts/cloud-sync-context";

export default function WeightScreen() {
  const router = useRouter();
  const { currentSession, updateCurrentSession, saveCurrentSessionAsFinal } = useSession();
  const [weightDist, setWeightDist] = useState<WeightDistribution>(
    currentSession?.weightDistribution || {
      frontLeftWeight: 0,
      frontRightWeight: 0,
      rearLeftWeight: 0,
      rearRightWeight: 0,
      crossWeightPercentage: 50,
      totalWeight: 0,
    }
  );

  const calculateCrossWeight = () => {
    const total =
      weightDist.frontLeftWeight +
      weightDist.frontRightWeight +
      weightDist.rearLeftWeight +
      weightDist.rearRightWeight;

    if (total === 0) return 50;

    const crossWeight = weightDist.frontLeftWeight + weightDist.rearRightWeight;
    return (crossWeight / total) * 100;
  };

  const { syncToCloud } = useCloudSync();

  const handleContinue = async () => {
    try {
      const updated = {
        ...weightDist,
        crossWeightPercentage: calculateCrossWeight(),
        totalWeight:
          weightDist.frontLeftWeight +
          weightDist.frontRightWeight +
          weightDist.rearLeftWeight +
          weightDist.rearRightWeight,
      };
      await updateCurrentSession({ weightDistribution: updated });
      // Save the complete setup
      await saveCurrentSessionAsFinal();
      // Sync to cloud
      await syncToCloud();
      // Navigate to live timing
      router.replace('/(tabs)/live-timing');
    } catch (error) {
      console.error('Error saving setup:', error);
      // Still navigate even if sync fails
      router.replace('/(tabs)/live-timing');
    }
  };

  const updateWeight = (key: string, value: number) => {
    setWeightDist((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const crossWeight = calculateCrossWeight();
  const totalWeight =
    weightDist.frontLeftWeight +
    weightDist.frontRightWeight +
    weightDist.rearLeftWeight +
    weightDist.rearRightWeight;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header with Back Button */}
          <View className="gap-2">
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-2xl text-primary mb-2">‹ Back</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Weight Distribution</Text>
            <Text className="text-sm text-muted">Enter tire weight measurements</Text>
          </View>

          {/* Weight Inputs */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Tire Weights (lbs)</Text>

            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted">Front Left</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                  value={weightDist.frontLeftWeight.toString()}
                  onChangeText={(value) =>
                    updateWeight("frontLeftWeight", parseFloat(value) || 0)
                  }
                  keyboardType="decimal-pad"
                  className="bg-background text-foreground px-2 py-1 rounded w-20 border border-border text-right"
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted">Front Right</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                  value={weightDist.frontRightWeight.toString()}
                  onChangeText={(value) =>
                    updateWeight("frontRightWeight", parseFloat(value) || 0)
                  }
                  keyboardType="decimal-pad"
                  className="bg-background text-foreground px-2 py-1 rounded w-20 border border-border text-right"
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted">Rear Left</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                  value={weightDist.rearLeftWeight.toString()}
                  onChangeText={(value) =>
                    updateWeight("rearLeftWeight", parseFloat(value) || 0)
                  }
                  keyboardType="decimal-pad"
                  className="bg-background text-foreground px-2 py-1 rounded w-20 border border-border text-right"
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted">Rear Right</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                  value={weightDist.rearRightWeight.toString()}
                  onChangeText={(value) =>
                    updateWeight("rearRightWeight", parseFloat(value) || 0)
                  }
                  keyboardType="decimal-pad"
                  className="bg-background text-foreground px-2 py-1 rounded w-20 border border-border text-right"
                />
              </View>
            </View>
          </View>

          {/* Summary Stats */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Weight Summary</Text>

            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Weight</Text>
                <Text className="text-foreground font-semibold">{totalWeight.toFixed(1)} lbs</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted">Cross Weight %</Text>
                <Text className="text-foreground font-semibold">{crossWeight.toFixed(1)}%</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted">Balance</Text>
                <Text
                  className={`font-semibold ${
                    Math.abs(crossWeight - 50) < 5 ? "text-success" : "text-warning"
                  }`}
                >
                  {Math.abs(crossWeight - 50) < 5 ? "Balanced" : "Unbalanced"}
                </Text>
              </View>
            </View>
          </View>

          {/* Info */}
          <View className="bg-primary/10 border border-primary rounded-lg p-3">
            <Text className="text-xs text-foreground">
              Cross weight is calculated as (FL + RR) / Total Weight. Optimal cross weight is
              typically 50-52% for most karting setups.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-success px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">Save Setup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
