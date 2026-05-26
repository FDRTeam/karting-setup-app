import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { generateShareCode, shareSetupViaFile, generateSetupSummary } from "@/lib/services/sharing";
import * as Clipboard from "expo-clipboard";
import type { KartingSession } from "@/lib/types";

interface ShareSetupModalProps {
  visible: boolean;
  session: KartingSession;
  onClose: () => void;
}

export function ShareSetupModal({ visible, session, onClose }: ShareSetupModalProps) {
  const [shareCode, setShareCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = () => {
    const code = generateShareCode(session);
    setShareCode(code);
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy share code");
    }
  };

  const handleShareFile = async () => {
    setLoading(true);
    try {
      await shareSetupViaFile(session);
    } catch (error) {
      Alert.alert("Error", "Failed to share setup file");
    } finally {
      setLoading(false);
    }
  };

  const handleShareText = async () => {
    try {
      const summary = generateSetupSummary(session);
      await Clipboard.setStringAsync(summary);
      Alert.alert("Success", "Setup summary copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy setup summary");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-surface rounded-t-3xl max-h-96">
          {/* Header */}
          <View className="p-4 border-b border-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-foreground">Share Setup</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary font-semibold">Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View className="p-4 gap-4">
              {/* Share Code Section */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Share Code</Text>
                <Text className="text-xs text-muted">
                  Share this code with other users to let them import your setup
                </Text>

                {!shareCode ? (
                  <TouchableOpacity
                    onPress={handleGenerateCode}
                    className="bg-primary px-4 py-3 rounded-lg items-center"
                  >
                    <Text className="text-background font-semibold">Generate Share Code</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-primary/10 border border-primary rounded-lg p-3">
                    <Text className="text-center text-2xl font-bold text-primary">{shareCode}</Text>
                    <TouchableOpacity
                      onPress={handleCopyCode}
                      className="bg-primary px-4 py-2 rounded-lg items-center mt-2"
                    >
                      <Text className="text-background font-semibold text-sm">
                        {copied ? "Copied!" : "Copy Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Share File Section */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Share as File</Text>
                <Text className="text-xs text-muted">
                  Export setup as JSON file to share via email, messaging, etc.
                </Text>

                <TouchableOpacity
                  onPress={handleShareFile}
                  disabled={loading}
                  className="bg-success px-4 py-3 rounded-lg items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-background font-semibold">Share File</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Share Summary Section */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Share Summary</Text>
                <Text className="text-xs text-muted">
                  Copy a formatted summary of your setup to share
                </Text>

                <TouchableOpacity
                  onPress={handleShareText}
                  className="bg-primary/20 px-4 py-3 rounded-lg items-center border border-primary"
                >
                  <Text className="text-primary font-semibold">Copy Summary</Text>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View className="bg-primary/10 border border-primary rounded-lg p-3">
                <Text className="text-xs text-foreground leading-relaxed">
                  Other FDR Kart Setup Data users can import your setup using the share code or
                  by importing the JSON file.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
