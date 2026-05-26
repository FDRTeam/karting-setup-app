import { ScrollView, Text, View, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SelectPicker } from "@/components/select-picker";
import { useSession } from "@/lib/session-context";
import type { TireSetup } from "@/lib/types";
import { useRouter } from "expo-router";

const TIRE_TYPES = ["MG Orange", "MG Red", "Vega Red"];
const RIM_METALLURGY = ["Aluminum", "Magnesium", "Steel", "Carbon Fiber"];

export default function TiresScreen() {
  const router = useRouter();
  const { currentSession, updateCurrentSession } = useSession();

  const getInitialTireSetup = (): TireSetup => {
    if (currentSession?.tireSetup) {
      // Normalize tire type: if stored type is not in current TIRE_TYPES, default to MG Orange
      let normalizedType = currentSession.tireSetup.type || "MG Orange";
      if (!TIRE_TYPES.includes(normalizedType)) {
        normalizedType = "MG Orange";
      }
      
      return {
        ...currentSession.tireSetup,
        type: normalizedType,
        pressureFrontLeft: currentSession.tireSetup.pressureFrontLeft ?? 1.0,
        pressureFrontRight: currentSession.tireSetup.pressureFrontRight ?? 1.0,
        pressureRearLeft: currentSession.tireSetup.pressureRearLeft ?? 1.0,
        pressureRearRight: currentSession.tireSetup.pressureRearRight ?? 1.0,
      };
    }
    return {
      type: "MG Orange",
      pressureFrontLeft: 1.0,
      pressureFrontRight: 1.0,
      pressureRearLeft: 1.0,
      pressureRearRight: 1.0,
      rimBrand: "",
      rimMetallurgy: "Aluminum",
      weightDistribution: {
        frontLeft: 0,
        frontRight: 0,
        rearLeft: 0,
        rearRight: 0,
      },
    };
  };

  const [tireSetup, setTireSetup] = useState<TireSetup>(() => {
    const initial = getInitialTireSetup();
    return {
      ...initial,
      type: initial.type || "MG Orange",
    };
  });

  const handleSave = async () => {
    await updateCurrentSession({ tireSetup });
    router.push("/(tabs)/chassis");
  };

  const updateTireSetup = (key: string, value: any) => {
    setTireSetup((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateWeightDistribution = (tire: string, value: number) => {
    setTireSetup((prev) => ({
      ...prev,
      weightDistribution: {
        ...(prev.weightDistribution || {
          frontLeft: 0,
          frontRight: 0,
          rearLeft: 0,
          rearRight: 0,
        }),
        [tire]: value,
      },
    }));
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header with Back Button */}
          <View className="gap-2">
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-2xl text-primary mb-2">‹ Back</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Tire Setup</Text>
            <Text className="text-sm text-muted">Configure your tire specifications</Text>
          </View>

          {/* Tire Type */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Tire Type</Text>
            <SelectPicker
              options={TIRE_TYPES}
              selectedValue={tireSetup.type}
              onValueChange={(value: string) => updateTireSetup("type", value)}
              label="Select Tire Type"
            />
          </View>

          {/* Tire Pressures (PSI) */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Tire Pressures (PSI)</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted">Front Left (PSI)</Text>
              <TextInput
                placeholder="0.0"
                placeholderTextColor="#9BA1A6"
                value={tireSetup.pressureFrontLeft.toString()}
                onChangeText={(value: string) =>
                  updateTireSetup("pressureFrontLeft", parseFloat(value) || 0)
                }
                keyboardType="decimal-pad"
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Front Right (PSI)</Text>
              <TextInput
                placeholder="0.0"
                placeholderTextColor="#9BA1A6"
                value={tireSetup.pressureFrontRight.toString()}
                onChangeText={(value: string) =>
                  updateTireSetup("pressureFrontRight", parseFloat(value) || 0)
                }
                keyboardType="decimal-pad"
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Rear Left (PSI)</Text>
              <TextInput
                placeholder="0.0"
                placeholderTextColor="#9BA1A6"
                value={tireSetup.pressureRearLeft.toString()}
                onChangeText={(value: string) =>
                  updateTireSetup("pressureRearLeft", parseFloat(value) || 0)
                }
                keyboardType="decimal-pad"
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Rear Right (PSI)</Text>
              <TextInput
                placeholder="0.0"
                placeholderTextColor="#9BA1A6"
                value={tireSetup.pressureRearRight.toString()}
                onChangeText={(value: string) =>
                  updateTireSetup("pressureRearRight", parseFloat(value) || 0)
                }
                keyboardType="decimal-pad"
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>
          </View>

          {/* Rim Details */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Rim Details</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted">Rim Brand</Text>
              <TextInput
                placeholder="e.g., OZ Racing"
                placeholderTextColor="#9BA1A6"
                value={tireSetup.rimBrand}
                onChangeText={(value: string) => updateTireSetup("rimBrand", value)}
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Rim Metallurgy</Text>
              <SelectPicker
                options={RIM_METALLURGY}
                selectedValue={tireSetup.rimMetallurgy}
                onValueChange={(value: string) => updateTireSetup("rimMetallurgy", value)}
                label="Select Metallurgy"
              />
            </View>
          </View>



          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-success px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">Continue to Chassis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
