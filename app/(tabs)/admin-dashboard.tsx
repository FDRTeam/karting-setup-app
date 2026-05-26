import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface UserSetup {
  id: number;
  userId: number;
  setup: string;
  trackName: string;
  kartNumber?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminDashboardScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [allSetups, setAllSetups] = useState<UserSetup[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || (user as any)?.role !== "admin") {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, (user as any)?.role]);

  // Fetch all setups
  const { data: setupsData } = trpc.setup.getAllAdmin.useQuery(undefined, {
    enabled: (user as any)?.role === "admin",
  });

  useEffect(() => {
    if (setupsData?.success && setupsData.data) {
      setAllSetups(setupsData.data as UserSetup[]);
      setLoading(false);
    }
  }, [setupsData]);

  const handleExportCSV = () => {
    if (allSetups.length === 0) {
      Alert.alert("No Data", "There are no setups to export.");
      return;
    }

    // Create CSV header
    const headers = ["Setup ID", "User ID", "Track Name", "Kart Number", "Date", "Created At"];
    const rows = allSetups.map((setup) => [
      setup.id,
      setup.userId,
      setup.trackName,
      setup.kartNumber || "N/A",
      new Date(setup.date).toLocaleDateString(),
      new Date(setup.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    // In a real app, you'd save this to a file or send it to the user
    console.log("CSV Export:", csvContent);
    Alert.alert("Export Successful", `Exported ${allSetups.length} setups to CSV`);
  };

  const handleExportJSON = () => {
    if (allSetups.length === 0) {
      Alert.alert("No Data", "There are no setups to export.");
      return;
    }

    const jsonContent = JSON.stringify(allSetups, null, 2);
    console.log("JSON Export:", jsonContent);
    Alert.alert("Export Successful", `Exported ${allSetups.length} setups to JSON`);
  };

  if (!isAuthenticated || (user as any)?.role !== "admin") {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <Text className="text-foreground">Access Denied</Text>
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
            <Text className="text-3xl font-bold text-foreground">Admin Dashboard</Text>
            <Text className="text-sm text-muted">
              Total Setups: {allSetups.length}
            </Text>
          </View>

          {/* Export Options */}
          <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Export Data</Text>

            <TouchableOpacity
              onPress={handleExportCSV}
              className="bg-primary px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">Export as CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportJSON}
              className="bg-primary px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">Export as JSON</Text>
            </TouchableOpacity>
          </View>

          {/* Setups List */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">All User Setups</Text>

            {allSetups.length === 0 ? (
              <View className="bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted">No setups found</Text>
              </View>
            ) : (
              allSetups.map((setup) => (
                <View
                  key={setup.id}
                  className="bg-surface rounded-lg p-4 border border-border gap-2"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {setup.trackName}
                      </Text>
                      <Text className="text-xs text-muted">
                        Kart: {setup.kartNumber || "N/A"}
                      </Text>
                    </View>
                    <View className="bg-primary/10 px-2 py-1 rounded">
                      <Text className="text-xs font-semibold text-primary">
                        User {setup.userId}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">
                      {new Date(setup.date).toLocaleDateString()}
                    </Text>
                    <Text className="text-xs text-muted">
                      ID: {setup.id}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
