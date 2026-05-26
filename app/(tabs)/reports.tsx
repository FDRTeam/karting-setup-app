import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { ReportGenerator } from "@/lib/services/report-generator";
import { useState } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

export default function ReportsScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const [generating, setGenerating] = useState(false);

  // Fetch analytics data
  const trackTrendsQuery = trpc.analytics.setupsByTrack.useQuery(undefined, {
    enabled: !!user && (user as any).role === "admin",
  });

  const kartStatsQuery = trpc.analytics.setupsByKart.useQuery(undefined, {
    enabled: !!user && (user as any).role === "admin",
  });

  const userStatsQuery = trpc.analytics.topUsers.useQuery({ limit: 10 }, {
    enabled: !!user && (user as any).role === "admin",
  });

  const summaryQuery = trpc.analytics.setupsByTrack.useQuery(undefined, {
    enabled: !!user && (user as any).role === "admin",
  });

  const generateReport = async (format: "text" | "csv" | "json") => {
    if (!trackTrendsQuery.data?.data || !kartStatsQuery.data?.data) {
      Alert.alert("Error", "Unable to load analytics data");
      return;
    }

    setGenerating(true);

    try {
      const reportData = {
        title: "Karting Setup Analytics Report",
        generatedAt: new Date().toISOString(),
        metrics: {
          totalSetups: (summaryQuery.data?.data as any)?.totalSetups || 0,
          totalUsers: (summaryQuery.data?.data as any)?.totalUsers || 0,
          activeUsers: (summaryQuery.data?.data as any)?.activeUsers || 0,
          averageSetupsPerUser: (summaryQuery.data?.data as any)?.averageSetupsPerUser || 0,
        },
        setupsByTrack: (trackTrendsQuery.data?.data as any) || [],
        setupsByKart: (kartStatsQuery.data?.data as any) || [],
        topUsers: (userStatsQuery.data?.data as any) || [],
        trends: [],
      } as any;

      let content = "";
      let filename = "";

      if (format === "text") {
        content = ReportGenerator.generateTextReport(reportData);
        filename = `karting-report-${Date.now()}.txt`;
      } else if (format === "csv") {
        content = ReportGenerator.generateCSVReport(reportData);
        filename = `karting-report-${Date.now()}.csv`;
      } else {
        content = ReportGenerator.generateJSONReport(reportData);
        filename = `karting-report-${Date.now()}.json`;
      }

      // Save to file system
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, content);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            format === "csv"
              ? "text/csv"
              : format === "json"
                ? "application/json"
                : "text/plain",
          dialogTitle: `Share ${format.toUpperCase()} Report`,
        });
      } else {
        Alert.alert("Success", `Report saved to ${filename}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate report");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  if ((user as any)?.role !== "admin") {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Admin access required</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Reports</Text>
          <Text className="text-sm text-muted mt-1">
            Export analytics data in multiple formats
          </Text>
        </View>

        {/* Report Format Selection */}
        <View className="gap-3 mb-6">
          <Text className="text-lg font-semibold text-foreground">Export Format</Text>

          <Pressable
            onPress={() => generateReport("text")}
            disabled={generating}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text className="font-semibold text-foreground">📄 Text Report</Text>
            <Text className="text-sm text-muted mt-2">
              Human-readable format with ASCII charts
            </Text>
          </Pressable>

          <Pressable
            onPress={() => generateReport("csv")}
            disabled={generating}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text className="font-semibold text-foreground">📊 CSV Report</Text>
            <Text className="text-sm text-muted mt-2">
              Spreadsheet format for Excel or Google Sheets
            </Text>
          </Pressable>

          <Pressable
            onPress={() => generateReport("json")}
            disabled={generating}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text className="font-semibold text-foreground">🔧 JSON Report</Text>
            <Text className="text-sm text-muted mt-2">
              Machine-readable format for integrations
            </Text>
          </Pressable>
        </View>

        {/* Report Contents */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="font-semibold text-foreground mb-3">Report Contents</Text>
          <View className="gap-2">
            <Text className="text-sm text-muted">✓ Key metrics summary</Text>
            <Text className="text-sm text-muted">✓ Setups by track distribution</Text>
            <Text className="text-sm text-muted">✓ Setups by kart number</Text>
            <Text className="text-sm text-muted">✓ Top users leaderboard</Text>
            <Text className="text-sm text-muted">✓ User activity trends</Text>
          </View>
        </View>

        {generating && (
          <View className="items-center">
            <Text className="text-muted">Generating report...</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
