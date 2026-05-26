import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

export default function TabLayout() {
  const colors = useColors();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;
  const isAdmin = (user as any)?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: "Weather",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cloud.sun.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: "Import",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.down.doc.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="live-timing"
        options={{
          title: "Live",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      {isAdmin && (
        <>
          <Tabs.Screen
            name="notifications"
            options={{
              title: "Notifications",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="reports"
            options={{
              title: "Reports",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: "Analytics",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="dashboard-settings"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
            }}
          />
        </>
      )}
      {/* Hidden screens for setup flow */}
      <Tabs.Screen
        name="tires"
        options={{
          href: null,
          title: "Tires",
        }}
      />
      <Tabs.Screen
        name="chassis"
        options={{
          href: null,
          title: "Chassis",
        }}
      />
      <Tabs.Screen
        name="engine"
        options={{
          href: null,
          title: "Engine",
        }}
      />
      <Tabs.Screen
        name="weight"
        options={{
          href: null,
          title: "Weight",
        }}
      />
      <Tabs.Screen
        name="gearing"
        options={{
          href: null,
          title: "Gearing",
        }}
      />
    </Tabs>
  );
}
