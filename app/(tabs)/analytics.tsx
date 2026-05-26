import { ScrollView, Text, View, ActivityIndicator, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface TrackData {
  track: string;
  count: number;
}

interface UserActivityData {
  totalUsers: number;
  activeUsers: number;
  totalSetups: number;
  averageSetupsPerUser: string;
}

interface TrendData {
  date: string;
  count: number;
}

interface TopUserData {
  userId: number;
  userName: string;
  setupCount: number;
}

interface KartData {
  kart: string;
  count: number;
}

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const userRole = (user as any)?.role;

  const [trackData, setTrackData] = useState<TrackData[]>([]);
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topUsers, setTopUsers] = useState<TopUserData[]>([]);
  const [kartData, setKartData] = useState<KartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, userRole]);

  // Fetch analytics data
  const { data: trackResponse } = trpc.analytics.setupsByTrack.useQuery(undefined, {
    enabled: userRole === "admin",
  });

  const { data: activityResponse } = trpc.analytics.userActivity.useQuery(undefined, {
    enabled: userRole === "admin",
  });

  const { data: trendResponse } = trpc.analytics.setupTrends.useQuery({ days: 30 }, {
    enabled: userRole === "admin",
  });

  const { data: topUsersResponse } = trpc.analytics.topUsers.useQuery({ limit: 5 }, {
    enabled: userRole === "admin",
  });

  const { data: kartResponse } = trpc.analytics.setupsByKart.useQuery(undefined, {
    enabled: userRole === "admin",
  });

  useEffect(() => {
    if (
      trackResponse?.success &&
      activityResponse?.success &&
      trendResponse?.success &&
      topUsersResponse?.success &&
      kartResponse?.success
    ) {
      setTrackData(trackResponse.data || []);
      setActivityData((activityResponse.data as UserActivityData) || null);
      setTrendData(trendResponse.data || []);
      setTopUsers(topUsersResponse.data || []);
      setKartData(kartResponse.data || []);
      setLoading(false);
    }
  }, [trackResponse, activityResponse, trendResponse, topUsersResponse, kartResponse]);

  if (!isAuthenticated || userRole !== "admin") {
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
        <Text className="mt-4 text-muted">Loading analytics...</Text>
      </ScreenContainer>
    );
  }

  // Calculate max values for bar charts
  const maxTrackCount = Math.max(...trackData.map((t) => t.count), 1);
  const maxTrendCount = Math.max(...trendData.map((t) => t.count), 1);
  const maxKartCount = Math.max(...kartData.map((k) => k.count), 1);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Analytics Dashboard</Text>
            <Text className="text-sm text-muted">Setup trends and user activity metrics</Text>
          </View>

          {/* Key Metrics */}
          {activityData && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Key Metrics</Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">Total Users</Text>
                  <Text className="text-2xl font-bold text-primary">{activityData.totalUsers}</Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">Active Users</Text>
                  <Text className="text-2xl font-bold text-success">{activityData.activeUsers}</Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">Total Setups</Text>
                  <Text className="text-2xl font-bold text-primary">{activityData.totalSetups}</Text>
                </View>
                <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">Avg per User</Text>
                  <Text className="text-2xl font-bold text-warning">{activityData.averageSetupsPerUser}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Setups by Track */}
          {trackData.length > 0 && (
            <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground">Setups by Track</Text>
              <View className="gap-3">
                {trackData.map((item, idx) => {
                  const barWidth = (item.count / maxTrackCount) * 100;
                  return (
                    <View key={idx} className="gap-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-medium text-foreground flex-1">
                          {item.track}
                        </Text>
                        <Text className="text-sm font-bold text-primary">{item.count}</Text>
                      </View>
                      <View className="bg-background rounded-full h-2 overflow-hidden">
                        <View
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${barWidth}%` as any }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Setups by Kart */}
          {kartData.length > 0 && (
            <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground">Setups by Kart</Text>
              <View className="gap-3">
                 {kartData.slice(0, 5).map((item, idx) => {
                  const barWidth = (item.count / maxKartCount) * 100;
                  return (
                    <View key={idx} className="gap-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-medium text-foreground flex-1">
                          {item.kart}
                        </Text>
                        <Text className="text-sm font-bold text-success">{item.count}</Text>
                      </View>
                      <View className="bg-background rounded-full h-2 overflow-hidden">
                        <View
                          className="bg-success h-full rounded-full"
                          style={{ width: `${barWidth}%` as any }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Setup Trends (Last 30 Days) */}
          {trendData.length > 0 && (
            <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground">Setup Trends (30 Days)</Text>
              <View className="gap-2">
                {trendData.slice(-7).map((item, idx) => {
                  const barWidth = (item.count / maxTrendCount) * 100;
                  return (
                    <View key={idx} className="gap-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-muted">{item.date}</Text>
                        <Text className="text-xs font-bold text-warning">{item.count}</Text>
                      </View>
                      <View className="bg-background rounded-full h-2 overflow-hidden">
                        <View
                          className="bg-warning h-full rounded-full"
                          style={{ width: `${barWidth}%` as any }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
              <Text className="text-xs text-muted text-center mt-2">
                Showing last 7 days of {trendData.length} total days
              </Text>
            </View>
          )}

          {/* Top Users */}
          {topUsers.length > 0 && (
            <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground">Top Users</Text>
              <View className="gap-2">
                {topUsers.map((user, idx) => (
                  <View key={idx} className="flex-row justify-between items-center p-3 bg-background rounded-lg">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{user.userName}</Text>
                      <Text className="text-xs text-muted">User #{user.userId}</Text>
                    </View>
                    <View className="bg-primary/10 px-3 py-1 rounded">
                      <Text className="text-sm font-bold text-primary">{user.setupCount} setups</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {trackData.length === 0 && (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-center">No analytics data available yet</Text>
              <Text className="text-xs text-muted text-center mt-2">
                Data will appear as users create and share setups
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
