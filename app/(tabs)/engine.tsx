import { ScrollView, Text, View, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SelectPicker } from "@/components/select-picker";
import { DatePicker } from "@/components/date-picker";
import { TimePicker } from "@/components/time-picker";
import { useSession } from "@/lib/session-context";
import type { EngineSetup } from "@/lib/types";
import { useRouter } from "expo-router";

const ENGINE_TYPES = ["B+S LO206", "IAME Micro-Swift", "IAME Mini-Swift", "IAME KA100 Jr", "IAME KA100 Sr"];
const SPARK_PLUG_TYPES = ["AR50", "AR51", "AR3910X", "BR10EG"];

export default function EngineScreen() {
  const router = useRouter();
  const { currentSession, updateCurrentSession } = useSession();

  const getInitialEngineSetup = (): EngineSetup => {
    if (currentSession?.engineSetup) {
      return currentSession.engineSetup;
    }
    return {
      type: "B+S LO206",
      serialNumber: "",
      sparkPlug: "",
      lastSparkPlugChangeDate: "",
      lastSparkPlugChangeTime: "",
      lastOilChangeDate: "",
      notes: "",
    };
  };

  const [engineSetup, setEngineSetup] = useState<EngineSetup>(getInitialEngineSetup());

  const handleSave = async () => {
    await updateCurrentSession({ engineSetup });
    router.push("/(tabs)/gearing");
  };

  const updateEngineSetup = (key: string, value: any) => {
    setEngineSetup((prev) => ({
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
            <Text className="text-3xl font-bold text-foreground">Engine</Text>
            <Text className="text-sm text-muted">Configure your engine specifications</Text>
          </View>

          {/* Engine Type */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Engine Type</Text>
            <SelectPicker
              options={ENGINE_TYPES}
              selectedValue={engineSetup.type}
              onValueChange={(value: string) => updateEngineSetup("type", value)}
              label="Select Engine Type"
            />
          </View>

          {/* Engine Details */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Engine Details</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted">Serial Number</Text>
              <TextInput
                placeholder="e.g., TM-2024-001"
                placeholderTextColor="#9BA1A6"
                value={engineSetup.serialNumber}
                onChangeText={(value) => updateEngineSetup("serialNumber", value)}
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>
          </View>

          {/* Spark Plug */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Spark Plug</Text>
            <SelectPicker
              options={SPARK_PLUG_TYPES}
              selectedValue={engineSetup.sparkPlug || ""}
              onValueChange={(value: string) => updateEngineSetup("sparkPlug", value)}
              label="Select Spark Plug Type"
            />
          </View>

          {/* Last Spark Plug Change */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Last Spark Plug Change</Text>

            <DatePicker
              value={engineSetup.lastSparkPlugChangeDate}
              onChange={(date) => updateEngineSetup("lastSparkPlugChangeDate", date)}
              label="Date"
            />

            <TimePicker
              value={engineSetup.lastSparkPlugChangeTime}
              onChange={(time) => updateEngineSetup("lastSparkPlugChangeTime", time)}
              label="Time"
            />
          </View>

          {/* Last Oil Change */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Last Oil Change</Text>

            <DatePicker
              value={engineSetup.lastOilChangeDate}
              onChange={(date) => updateEngineSetup("lastOilChangeDate", date)}
              label="Date"
            />
          </View>

          {/* Notes */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground">Notes</Text>
            <View className="gap-2">
              <TextInput
                placeholder="Any additional notes about the engine"
                placeholderTextColor="#9BA1A6"
                value={engineSetup.notes || ""}
                onChangeText={(value) => updateEngineSetup("notes", value)}
                multiline
                numberOfLines={3}
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-success px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">Continue to Gearing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
