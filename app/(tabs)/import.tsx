import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useSession } from "@/lib/session-context";
import { parseShareableSetup, isSetupCompatible } from "@/lib/services/sharing";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";

export default function ImportScreen() {
  const router = useRouter();
  const { addSession } = useSession();
  const [shareCode, setShareCode] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "file" | "json">("code");

  const handleImportFromCode = async () => {
    if (!shareCode.trim()) {
      Alert.alert("Error", "Please enter a share code");
      return;
    }

    // Note: In a real app, this would query a backend to retrieve the setup
    // For now, show a placeholder message
    Alert.alert("Coming Soon", "Share code import will be available with cloud sync");
  };

  const handleImportFromFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const shareableSetup = parseShareableSetup(fileContent);

      if (!isSetupCompatible(shareableSetup)) {
        Alert.alert("Error", "This setup format is not compatible with your app version");
        return;
      }

      // Add the imported setup to sessions
      await addSession(shareableSetup.setup);

      Alert.alert("Success", "Setup imported successfully!", [
        {
          text: "View Setup",
          onPress: () => router.push("/(tabs)/history"),
        },
        {
          text: "Done",
          onPress: () => setJsonInput(""),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to import setup");
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromJSON = async () => {
    if (!jsonInput.trim()) {
      Alert.alert("Error", "Please paste setup JSON");
      return;
    }

    try {
      setLoading(true);
      const shareableSetup = parseShareableSetup(jsonInput);

      if (!isSetupCompatible(shareableSetup)) {
        Alert.alert("Error", "This setup format is not compatible with your app version");
        return;
      }

      // Add the imported setup to sessions
      await addSession(shareableSetup.setup);

      Alert.alert("Success", "Setup imported successfully!", [
        {
          text: "View Setup",
          onPress: () => router.push("/(tabs)/history"),
        },
        {
          text: "Done",
          onPress: () => setJsonInput(""),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to import setup");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteJSON = async () => {
    try {
      const clipboard = await Clipboard.getStringAsync();
      setJsonInput(clipboard);
    } catch (error) {
      Alert.alert("Error", "Failed to read clipboard");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Import Setup</Text>
            <Text className="text-sm text-muted">Load a setup shared by another user</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2">
            {(["code", "file", "json"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg border ${
                  activeTab === tab
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    activeTab === tab ? "text-background" : "text-foreground"
                  }`}
                >
                  {tab === "code" ? "Code" : tab === "file" ? "File" : "JSON"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Share Code Tab */}
          {activeTab === "code" && (
            <View className="gap-3 bg-surface rounded-2xl p-4">
              <Text className="text-sm font-semibold text-foreground">Share Code</Text>
              <Text className="text-xs text-muted">
                Enter the share code provided by another user
              </Text>

              <TextInput
                placeholder="e.g., DAYT-2026-A7K2"
                placeholderTextColor="#9BA1A6"
                value={shareCode}
                onChangeText={setShareCode}
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border uppercase"
              />

              <TouchableOpacity
                onPress={handleImportFromCode}
                className="bg-primary px-4 py-3 rounded-lg items-center"
              >
                <Text className="text-background font-semibold">Import from Code</Text>
              </TouchableOpacity>

              <View className="bg-primary/10 border border-primary rounded-lg p-3">
                <Text className="text-xs text-foreground">
                  Share codes will work once cloud sync is enabled
                </Text>
              </View>
            </View>
          )}

          {/* File Tab */}
          {activeTab === "file" && (
            <View className="gap-3 bg-surface rounded-2xl p-4">
              <Text className="text-sm font-semibold text-foreground">Import from File</Text>
              <Text className="text-xs text-muted">
                Select a JSON setup file exported by another user
              </Text>

              <TouchableOpacity
                onPress={handleImportFromFile}
                disabled={loading}
                className="bg-success px-4 py-3 rounded-lg items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-background font-semibold">Choose File</Text>
                )}
              </TouchableOpacity>

              <View className="bg-primary/10 border border-primary rounded-lg p-3">
                <Text className="text-xs text-foreground">
                  Select a .json file that was exported from FDR Kart Setup Data
                </Text>
              </View>
            </View>
          )}

          {/* JSON Tab */}
          {activeTab === "json" && (
            <View className="gap-3 bg-surface rounded-2xl p-4">
              <Text className="text-sm font-semibold text-foreground">Paste JSON</Text>
              <Text className="text-xs text-muted">
                Paste the setup JSON data directly
              </Text>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handlePasteJSON}
                  className="flex-1 bg-primary/20 px-3 py-2 rounded-lg border border-primary items-center"
                >
                  <Text className="text-primary font-semibold text-sm">Paste</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setJsonInput("")}
                  className="flex-1 bg-error/20 px-3 py-2 rounded-lg border border-error items-center"
                >
                  <Text className="text-error font-semibold text-sm">Clear</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Paste setup JSON here..."
                placeholderTextColor="#9BA1A6"
                value={jsonInput}
                onChangeText={setJsonInput}
                multiline
                numberOfLines={6}
                className="bg-background text-foreground px-3 py-2 rounded-lg border border-border"
              />

              <TouchableOpacity
                onPress={handleImportFromJSON}
                disabled={loading}
                className="bg-success px-4 py-3 rounded-lg items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-background font-semibold">Import Setup</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4">
            <Text className="text-sm text-foreground leading-relaxed">
              You can import setups from other FDR Kart Setup Data users using share codes, files,
              or JSON data. All imported setups are saved to your local history.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
