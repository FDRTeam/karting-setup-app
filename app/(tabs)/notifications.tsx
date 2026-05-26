import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityId: number | null;
  relatedEntityType: string | null;
  isRead: number;
  createdAt: Date | string;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const notificationsQuery = trpc.notifications.getAll.useQuery(undefined, {
    enabled: !!user,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  useEffect(() => {
    if (notificationsQuery.data?.success && notificationsQuery.data.data) {
      setNotifications(notificationsQuery.data.data);
      setLoading(false);
    }
  }, [notificationsQuery.data]);

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsReadMutation.mutateAsync({ notificationId });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: 1 } : n))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "issue_created":
        return "🔴";
      case "issue_assigned":
        return "👤";
      case "issue_resolved":
        return "✅";
      case "anomaly_detected":
        return "⚠️";
      case "user_joined":
        return "👥";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "issue_created":
        return colors.error;
      case "issue_assigned":
        return colors.primary;
      case "issue_resolved":
        return colors.success;
      case "anomaly_detected":
        return colors.warning;
      case "user_joined":
        return colors.primary;
      default:
        return colors.muted;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable
      onPress={() => handleMarkAsRead(item.id)}
      style={({ pressed }) => [
        {
          backgroundColor: item.isRead === 0 ? colors.surface : "transparent",
          borderLeftColor: getNotificationColor(item.type),
          borderLeftWidth: 4,
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View className="flex-row items-start gap-3">
        <Text className="text-2xl">{getNotificationIcon(item.type)}</Text>
        <View className="flex-1">
          <Text className="font-semibold text-foreground">{item.title}</Text>
          <Text className="text-sm text-muted mt-1">{item.message}</Text>
          <Text className="text-xs text-muted mt-2">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {item.isRead === 0 && (
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading notifications...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground">Notifications</Text>
        <Text className="text-sm text-muted mt-1">
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">No notifications yet</Text>
          <Text className="text-sm text-muted mt-2">
            You'll see alerts here when issues are reported or resolved
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}
