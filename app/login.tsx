import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LoginScreen() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading]);

  const handleLogin = async () => {
    try {
      await startOAuthLogin();
    } catch (error) {
      console.error("[Login] Error starting OAuth:", error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="mt-4 text-muted">Loading...</Text>
      </ScreenContainer>
    );
  }

  if (isAuthenticated && user) {
    return (
      <ScreenContainer className="flex items-center justify-center p-4">
        <View className="gap-4 items-center">
          <Text className="text-2xl font-bold text-foreground">Welcome back!</Text>
          <Text className="text-lg text-foreground">{user.name || user.email || "User"}</Text>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-sm text-muted">Redirecting...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="gap-2 items-center mb-8">
            <Text className="text-4xl font-bold text-foreground">Karting Setup Pro</Text>
            <Text className="text-base text-muted text-center">
              Track weather, tires, chassis, engine, and weight distribution for optimal performance
            </Text>
          </View>

          {/* Features List */}
          <View className="gap-4 mb-8">
            <FeatureItem
              icon="☁️"
              title="Cloud Sync"
              description="Access your setups from any device"
            />
            <FeatureItem
              icon="📊"
              title="Live Timing"
              description="Track lap times from multiple platforms"
            />
            <FeatureItem
              icon="🌡️"
              title="Real-time Sensors"
              description="Monitor asphalt temperature with IoT sensors"
            />
            <FeatureItem
              icon="📈"
              title="Correlation Analysis"
              description="Correlate setup changes with performance"
            />
          </View>

          {/* Login Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-primary px-6 py-4 rounded-lg items-center"
            >
              <Text className="text-background font-bold text-lg">Sign In with Manus</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/email-login")}
              className="bg-surface border border-border px-6 py-4 rounded-lg items-center"
            >
              <Text className="text-foreground font-bold text-lg">Sign In with Email</Text>
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View className="gap-2 mt-4 p-4 bg-surface rounded-lg">
            <Text className="text-sm text-foreground font-semibold">Why sign in?</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Create an account to sync your setup data across all your devices. Your data is securely stored and only visible to you (unless you're an admin).
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row gap-3 p-4 bg-surface rounded-lg">
      <Text className="text-2xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted">{description}</Text>
      </View>
    </View>
  );
}
