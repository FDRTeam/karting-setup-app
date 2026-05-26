import { ScrollView, Text, View, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SelectPicker } from "@/components/select-picker";
import { useSession } from "@/lib/session-context";
import type { ChassisSetup } from "@/lib/types";
import { useRouter } from "expo-router";

const CHASSIS_TYPES = ["Birel Art", "Tony Kart", "CRG", "Exprit", "Kosmic", "Ricciardo", "TB Kart", "Coyote", "Margay", "Kart Republic", "Factory Kart"];
const AXLE_STIFFNESS_OPTIONS = ["S", "M1", "M2", "M3", "H1", "H2"];
const AXLE_BRANDS = ["OTK", "PKT", "RR", "ItalKart", "Birel", "CRG", "IPK", "PMC", "Coyote", "MGM", "Margay", "Factory Kart", "Other"];

export default function ChassisScreen() {
  const router = useRouter();
  const { currentSession, updateCurrentSession } = useSession();

  const getInitialChassisSetup = (): ChassisSetup => {
    if (currentSession?.chassisSetup) {
      return {
        ...currentSession.chassisSetup,
        frontLeft: currentSession.chassisSetup.frontLeft || {
          caster: 0,
          camber: 0,
          toe: 0,
        },
        frontRight: currentSession.chassisSetup.frontRight || {
          caster: 0,
          camber: 0,
          toe: 0,
        },
      };
    }
    return {
      type: "Birel Art",
      serialNumber: "",
      frontLeft: {
        caster: 0,
        camber: 0,
        toe: 0,
      },
      frontRight: {
        caster: 0,
        camber: 0,
        toe: 0,
      },
      axleBrand: "",
      axleWidth: 0,
      axleStiffness: "M2",
    };
  };

  const [chassisSetup, setChassisSetup] = useState<ChassisSetup>(() => {
    const initial = getInitialChassisSetup();
    return {
      ...initial,
      frontLeft: initial.frontLeft || {
        caster: 0,
        camber: 0,
        toe: 0,
      },
      frontRight: initial.frontRight || {
        caster: 0,
        camber: 0,
        toe: 0,
      },
    };
  });

  const handleSave = async () => {
    await updateCurrentSession({ chassisSetup });
    router.push("/(tabs)/setup/width");
  };

  const updateFrontLeft = (key: string, value: number) => {
    setChassisSetup((prev) => ({
      ...prev,
      frontLeft: {
        ...(prev.frontLeft || { caster: 0, camber: 0, toe: 0 }),
        [key]: value,
      },
    }));
  };

  const updateFrontRight = (key: string, value: number) => {
    setChassisSetup((prev) => ({
      ...prev,
      frontRight: {
        ...(prev.frontRight || { caster: 0, camber: 0, toe: 0 }),
        [key]: value,
      },
    }));
  };

  const updateChassisSetup = (key: string, value: any) => {
    setChassisSetup((prev) => ({
      ...prev,
      [key]: value,
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
            <Text className="text-3xl font-bold text-foreground">Chassis Setup</Text>
            <Text className="text-sm text-muted">Configure your chassis geometry</Text>
          </View>

          {/* Chassis Type */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Chassis Type</Text>
            <SelectPicker
              options={CHASSIS_TYPES}
              selectedValue={chassisSetup.type}
              onValueChange={(value: string) => updateChassisSetup("type", value)}
              label="Select Chassis Type"
            />
          </View>

          {/* Chassis Serial Number */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Chassis Serial Number</Text>
            <TextInput
              placeholder="e.g., BRT-2024-001"
              placeholderTextColor="#9BA1A6"
              value={chassisSetup.serialNumber}
              onChangeText={(value) => updateChassisSetup("serialNumber", value)}
              className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
            />
          </View>

          {/* Front Geometry - Left and Right Columns */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Front Geometry (degrees)</Text>

            <View className="flex-row gap-4">
              {/* Front Left Column */}
              <View className="flex-1 gap-3">
                <Text className="text-xs font-semibold text-primary">Front Left</Text>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Caster</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#9BA1A6"
                    value={chassisSetup.frontLeft.caster.toString()}
                    onChangeText={(value) =>
                      updateFrontLeft("caster", parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Camber</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#9BA1A6"
                    value={chassisSetup.frontLeft.camber.toString()}
                    onChangeText={(value) =>
                      updateFrontLeft("camber", parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Toe</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#9BA1A6"
                    value={chassisSetup.frontLeft.toe.toString()}
                    onChangeText={(value) =>
                      updateFrontLeft("toe", parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                  />
                </View>
              </View>

              {/* Front Right Column */}
              <View className="flex-1 gap-3">
                <Text className="text-xs font-semibold text-primary">Front Right</Text>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Caster</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#9BA1A6"
                    value={chassisSetup.frontRight.caster.toString()}
                    onChangeText={(value) =>
                      updateFrontRight("caster", parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Camber</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#9BA1A6"
                    value={chassisSetup.frontRight.camber.toString()}
                    onChangeText={(value) =>
                      updateFrontRight("camber", parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Toe</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#9BA1A6"
                    value={chassisSetup.frontRight.toe.toString()}
                    onChangeText={(value) =>
                      updateFrontRight("toe", parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Axle Settings */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Axle Settings</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted">Axle Width (mm)</Text>
              <TextInput
                placeholder="0"
                placeholderTextColor="#9BA1A6"
                value={chassisSetup.axleWidth?.toString() || ""}
                onChangeText={(value) => updateChassisSetup("axleWidth", parseFloat(value) || 0)}
                keyboardType="decimal-pad"
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Axle Brand</Text>
              <SelectPicker
                options={AXLE_BRANDS}
                selectedValue={chassisSetup.axleBrand}
                onValueChange={(value: string) => updateChassisSetup("axleBrand", value)}
                label="Select Axle Brand"
              />
            </View>

            {chassisSetup.axleBrand === "Other" && (
              <View className="gap-2">
                <Text className="text-xs text-muted">Other Axle Brand</Text>
                <TextInput
                  placeholder="Enter brand name"
                  placeholderTextColor="#9BA1A6"
                  value={chassisSetup.axleBrandOther || ""}
                  onChangeText={(value) => updateChassisSetup("axleBrandOther", value)}
                  className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                />
              </View>
            )}

            <View className="gap-2">
              <Text className="text-xs text-muted">Axle Stiffness</Text>
              <SelectPicker
                options={AXLE_STIFFNESS_OPTIONS}
                selectedValue={chassisSetup.axleStiffness}
                onValueChange={(value: string) => updateChassisSetup("axleStiffness", value)}
                label="Select Axle Stiffness"
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-success px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">Continue to Chassis Setup 2</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
