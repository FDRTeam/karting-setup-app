import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSession } from "@/lib/session-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const router = useRouter();
  const { sessions } = useSession();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNewSetup = () => {
    router.push("/(tabs)/weather");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-8">
          {/* User Profile Header */}
          {isAuthenticated && user && (
            <View className="flex-row justify-between items-center bg-surface rounded-lg p-4 border border-border">
              <View className="flex-1">
                <Text className="text-sm text-muted">Logged in as</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {user.name || user.email || "User"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-error/10 px-3 py-2 rounded-lg"
              >
                <Text className="text-error font-semibold text-sm">Logout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hero Section */}
          <View className="items-center gap-4">
            <Text className="text-4xl font-bold text-foreground">Karting Setup Pro</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              Track weather, tires, chassis, engine, and weight distribution for optimal
              performance
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="gap-3">
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Total Setups</Text>
              <Text className="text-3xl font-bold text-foreground">{sessions.length}</Text>
            </View>
          </View>

          {/* Main CTA */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleNewSetup}
              className="bg-primary px-6 py-4 rounded-xl items-center"
            >
              <Text className="text-background font-bold text-lg">Create New Setup</Text>
            </TouchableOpacity>

            <Text className="text-xs text-muted text-center">
              Start by entering your track location and weather conditions
            </Text>
          </View>

          {/* Features Overview */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Features</Text>

            <View className="gap-2">
              <View className="flex-row gap-3 bg-surface rounded-lg p-3 border border-border">
                <Text className="text-primary text-lg">🌤️</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Live Weather</Text>
                  <Text className="text-xs text-muted">
                    Current conditions and track temperature
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 bg-surface rounded-lg p-3 border border-border">
                <Text className="text-primary text-lg">🛞</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Tire Setup</Text>
                  <Text className="text-xs text-muted">
                    Type, pressure, rim details, weight distribution
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 bg-surface rounded-lg p-3 border border-border">
                <Text className="text-primary text-lg">🏎️</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Chassis Geometry</Text>
                  <Text className="text-xs text-muted">
                    Caster, camber, toe, and axle configuration
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 bg-surface rounded-lg p-3 border border-border">
                <Text className="text-primary text-lg">⚙️</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Engine Details</Text>
                  <Text className="text-xs text-muted">
                    Type, serial number, displacement, power
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 bg-surface rounded-lg p-3 border border-border">
                <Text className="text-primary text-lg">⚡</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Gearing</Text>
                  <Text className="text-xs text-muted">
                    Sprocket teeth and gear ratios
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 bg-surface rounded-lg p-3 border border-border">
                <Text className="text-primary text-lg">⚖️</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Weight Distribution</Text>
                  <Text className="text-xs text-muted">
                    Tire weights and cross-weight percentage
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Setups */}
          {sessions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Recent Setups</Text>
              <View className="gap-2">
                {sessions.slice(-3).map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    onPress={() => router.push("/(tabs)/history")}
                    className="bg-surface rounded-lg p-3 border border-border"
                  >
                    <Text className="font-semibold text-foreground">{session.trackName}</Text>
                    <Text className="text-xs text-muted">
                      {new Date(session.date).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Info Box */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4">
            <Text className="text-sm text-foreground leading-relaxed">
              Save your setups for different tracks and weather conditions. Compare setups to
              optimize your kart performance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
