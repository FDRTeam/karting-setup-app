import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface Setup {
  id: number;
  userId: number;
  setup: string;
  trackName: string;
  kartNumber?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function ShareSetupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mySetups, setMySetups] = useState<Setup[]>([]);
  const [sharedSetups, setSharedSetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetupId, setSelectedSetupId] = useState<number | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePhone, setSharePhone] = useState("");
  const [shareMethod, setShareMethod] = useState<"email" | "phone">("email");

  // Fetch user's own setups
  const { data: setupsData } = trpc.setup.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch shared setups
  const { data: sharedData } = trpc.setup.getShared.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Share setup mutation
  const shareSetupMutation = trpc.setup.share.useMutation();

  useEffect(() => {
    if (setupsData?.success && setupsData.data) {
      setMySetups(setupsData.data as Setup[]);
      setLoading(false);
    }
  }, [setupsData]);

  useEffect(() => {
    if (sharedData?.success && sharedData.data) {
      setSharedSetups(sharedData.data);
    }
  }, [sharedData]);

  const handleShareSetup = async () => {
    if (!selectedSetupId) {
      Alert.alert("Error", "Please select a setup to share");
      return;
    }

    if (shareMethod === "email" && !shareEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (shareMethod === "phone" && !sharePhone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    try {
      await shareSetupMutation.mutateAsync({
        setupId: selectedSetupId,
        sharedWithEmail: shareMethod === "email" ? shareEmail : undefined,
        sharedWithPhone: shareMethod === "phone" ? sharePhone : undefined,
      });

      Alert.alert("Success", "Setup shared successfully!");
      setSelectedSetupId(null);
      setShareEmail("");
      setSharePhone("");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to share setup");
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <Text className="text-foreground">Please log in to share setups</Text>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="mt-4 text-muted">Loading setups...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Share Setups</Text>
            <Text className="text-sm text-muted">
              Share your setups with other users or view setups shared with you
            </Text>
          </View>

          {/* Share Setup Section */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-4">
            <Text className="text-lg font-semibold text-foreground">Share a Setup</Text>

            {/* Select Setup */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Select Setup</Text>
              {mySetups.length === 0 ? (
                <Text className="text-muted">No setups to share</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  {mySetups.map((setup) => (
                    <TouchableOpacity
                      key={setup.id}
                      onPress={() => setSelectedSetupId(setup.id)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedSetupId === setup.id
                          ? "bg-primary"
                          : "bg-background border border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedSetupId === setup.id ? "text-background" : "text-foreground"
                        }`}
                      >
                        {setup.trackName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Share Method */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Share Via</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setShareMethod("email")}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    shareMethod === "email" ? "bg-primary" : "bg-background border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      shareMethod === "email" ? "text-background" : "text-foreground"
                    }`}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShareMethod("phone")}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    shareMethod === "phone" ? "bg-primary" : "bg-background border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      shareMethod === "phone" ? "text-background" : "text-foreground"
                    }`}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Field */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                {shareMethod === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <TextInput
                placeholder={shareMethod === "email" ? "user@example.com" : "+1 (555) 123-4567"}
                value={shareMethod === "email" ? shareEmail : sharePhone}
                onChangeText={shareMethod === "email" ? setShareEmail : setSharePhone}
                keyboardType={shareMethod === "email" ? "email-address" : "phone-pad"}
                className="border border-border rounded-lg px-3 py-2 text-foreground"
                placeholderTextColor="#687076"
              />
            </View>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShareSetup}
              className="bg-primary px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">Share Setup</Text>
            </TouchableOpacity>
          </View>

          {/* Shared With Me Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Setups Shared With Me ({sharedSetups.length})
            </Text>

            {sharedSetups.length === 0 ? (
              <View className="bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted">No setups shared with you yet</Text>
              </View>
            ) : (
              sharedSetups.map((share) => (
                <View
                  key={share.id}
                  className="bg-surface rounded-lg p-4 border border-border gap-2"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        Setup #{share.setupId}
                      </Text>
                      <Text className="text-xs text-muted">
                        From User {share.ownerId}
                      </Text>
                    </View>
                    <View className="bg-success/10 px-2 py-1 rounded">
                      <Text className="text-xs font-semibold text-success">
                        {share.permission.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs text-muted">
                    Shared on {new Date(share.createdAt).toLocaleDateString()}
                  </Text>

                  <TouchableOpacity className="bg-primary px-3 py-2 rounded-lg items-center mt-2">
                    <Text className="text-background font-semibold text-sm">View Setup</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
