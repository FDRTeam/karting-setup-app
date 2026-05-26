import { ScrollView, Text, View, Pressable, Switch, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { DashboardWidgetManager, AVAILABLE_WIDGETS, Widget } from "@/lib/services/dashboard-widgets";
import { useState, useEffect } from "react";
import { Alert } from "react-native";

export default function DashboardSettingsScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const preferencesQuery = trpc.dashboard.getPreferences.useQuery(undefined, {
    enabled: !!user,
  });

  const savePreferencesMutation = trpc.dashboard.savePreferences.useMutation();

  useEffect(() => {
    if (preferencesQuery.data?.success && preferencesQuery.data.data) {
      const config = DashboardWidgetManager.parseConfig(preferencesQuery.data.data.widgets);
      if (config) {
        setWidgets(config.widgets);
      }
    }
    setLoading(false);
  }, [preferencesQuery.data]);

  const handleToggleWidget = async (widgetId: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(updatedWidgets);

    // Save to server
    const config = { widgets: updatedWidgets, lastUpdated: new Date().toISOString() };
    await savePreferencesMutation.mutateAsync({
      widgets: JSON.stringify(config),
    });
  };

  const handleResetToDefault = async () => {
    Alert.alert("Reset Dashboard", "Restore default widget configuration?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Reset",
        onPress: async () => {
          const userRole = (user as any)?.role || "user";
          const defaultConfig = DashboardWidgetManager.createDefaultConfig(userRole);
          setWidgets(defaultConfig.widgets);

          await savePreferencesMutation.mutateAsync({
            widgets: JSON.stringify(defaultConfig),
          });
        },
      },
    ]);
  };

  const renderWidget = ({ item }: { item: Widget }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View className="flex-1">
        <Text className="font-semibold text-foreground">{item.title}</Text>
        <Text className="text-sm text-muted mt-1">{item.description}</Text>
        <Text className="text-xs text-muted mt-2">Size: {item.size}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => handleToggleWidget(item.id)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={item.enabled ? colors.primary : colors.muted}
      />
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading preferences...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Dashboard Settings</Text>
          <Text className="text-sm text-muted mt-1">
            Customize which widgets appear on your dashboard
          </Text>
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.primary,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            marginBottom: 6,
          }}
        >
          <Text className="text-sm text-foreground">
            Toggle widgets on or off to customize your dashboard. Changes are saved automatically.
          </Text>
        </View>

        {/* Widgets List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Available Widgets</Text>
          <FlatList
            data={widgets}
            renderItem={renderWidget}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Reset Button */}
        <Pressable
          onPress={handleResetToDefault}
          style={({ pressed }) => [
            {
              backgroundColor: colors.error,
              borderRadius: 12,
              padding: 16,
              opacity: pressed ? 0.8 : 1,
              marginBottom: 20,
            },
          ]}
        >
          <Text className="text-center font-semibold text-white">
            Reset to Default
          </Text>
        </Pressable>

        {/* Widget Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <Text className="font-semibold text-foreground mb-2">Widget Sizes</Text>
          <Text className="text-sm text-muted mb-2">
            <Text className="font-semibold">Small:</Text> Single metric cards
          </Text>
          <Text className="text-sm text-muted mb-2">
            <Text className="font-semibold">Medium:</Text> Charts and lists
          </Text>
          <Text className="text-sm text-muted">
            <Text className="font-semibold">Large:</Text> Full-width analytics
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
