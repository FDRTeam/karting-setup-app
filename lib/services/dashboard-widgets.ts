/**
 * Dashboard widget system for customizable user preferences
 */

export type WidgetType =
  | "total_setups"
  | "active_users"
  | "avg_setups_per_user"
  | "top_track"
  | "top_kart"
  | "open_issues"
  | "high_priority_issues"
  | "setup_trends"
  | "user_activity"
  | "recent_notifications";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  position: number;
  enabled: boolean;
  size: "small" | "medium" | "large";
}

export interface DashboardConfig {
  widgets: Widget[];
  lastUpdated: string;
}

export const AVAILABLE_WIDGETS: Record<WidgetType, Omit<Widget, "position" | "enabled">> = {
  total_setups: {
    id: "total_setups",
    type: "total_setups",
    title: "Total Setups",
    description: "Total number of setups created",
    size: "small",
  },
  active_users: {
    id: "active_users",
    type: "active_users",
    title: "Active Users",
    description: "Number of users who have created setups",
    size: "small",
  },
  avg_setups_per_user: {
    id: "avg_setups_per_user",
    type: "avg_setups_per_user",
    title: "Avg Setups/User",
    description: "Average setups per active user",
    size: "small",
  },
  top_track: {
    id: "top_track",
    type: "top_track",
    title: "Top Track",
    description: "Most popular track",
    size: "medium",
  },
  top_kart: {
    id: "top_kart",
    type: "top_kart",
    title: "Top Kart",
    description: "Most used kart number",
    size: "medium",
  },
  open_issues: {
    id: "open_issues",
    type: "open_issues",
    title: "Open Issues",
    description: "Number of unresolved issues",
    size: "small",
  },
  high_priority_issues: {
    id: "high_priority_issues",
    type: "high_priority_issues",
    title: "High Priority Issues",
    description: "Number of high-priority unresolved issues",
    size: "small",
  },
  setup_trends: {
    id: "setup_trends",
    type: "setup_trends",
    title: "Setup Trends",
    description: "Setup activity over the last 7 days",
    size: "large",
  },
  user_activity: {
    id: "user_activity",
    type: "user_activity",
    title: "User Activity",
    description: "User engagement metrics",
    size: "large",
  },
  recent_notifications: {
    id: "recent_notifications",
    type: "recent_notifications",
    title: "Recent Notifications",
    description: "Latest alerts and updates",
    size: "large",
  },
};

export class DashboardWidgetManager {
  /**
   * Create default dashboard configuration
   */
  static createDefaultConfig(userRole: "admin" | "manager" | "user"): DashboardConfig {
    const baseWidgets: WidgetType[] = ["total_setups", "active_users", "avg_setups_per_user"];

    const roleSpecificWidgets: Record<string, WidgetType[]> = {
      admin: [...baseWidgets, "top_track", "top_kart", "setup_trends", "user_activity"],
      manager: ["open_issues", "high_priority_issues", "recent_notifications"],
      user: ["total_setups"],
    };

    const widgetTypes = roleSpecificWidgets[userRole] || baseWidgets;

    const widgets: Widget[] = widgetTypes.map((type, index) => ({
      ...AVAILABLE_WIDGETS[type],
      position: index,
      enabled: true,
    }));

    return {
      widgets,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Parse widget configuration from JSON string
   */
  static parseConfig(jsonString: string): DashboardConfig | null {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse dashboard config:", error);
      return null;
    }
  }

  /**
   * Serialize widget configuration to JSON string
   */
  static serializeConfig(config: DashboardConfig): string {
    return JSON.stringify(config);
  }

  /**
   * Get enabled widgets sorted by position
   */
  static getEnabledWidgets(config: DashboardConfig): Widget[] {
    return config.widgets.filter((w) => w.enabled).sort((a, b) => a.position - b.position);
  }

  /**
   * Add a widget to configuration
   */
  static addWidget(config: DashboardConfig, widgetType: WidgetType): DashboardConfig {
    const existingWidget = config.widgets.find((w) => w.type === widgetType);
    if (existingWidget) {
      return config;
    }

    const newWidget: Widget = {
      ...AVAILABLE_WIDGETS[widgetType],
      position: config.widgets.length,
      enabled: true,
    };

    return {
      ...config,
      widgets: [...config.widgets, newWidget],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Remove a widget from configuration
   */
  static removeWidget(config: DashboardConfig, widgetId: string): DashboardConfig {
    return {
      ...config,
      widgets: config.widgets.filter((w) => w.id !== widgetId),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Toggle widget enabled state
   */
  static toggleWidget(config: DashboardConfig, widgetId: string): DashboardConfig {
    return {
      ...config,
      widgets: config.widgets.map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      ),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Reorder widgets
   */
  static reorderWidgets(config: DashboardConfig, widgetIds: string[]): DashboardConfig {
    const widgetMap = new Map(config.widgets.map((w) => [w.id, w]));
    const reorderedWidgets = widgetIds
      .map((id) => widgetMap.get(id))
      .filter((w): w is Widget => w !== undefined)
      .map((w, index) => ({ ...w, position: index }));

    return {
      ...config,
      widgets: reorderedWidgets,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Reset to default configuration
   */
  static resetToDefault(userRole: "admin" | "manager" | "user"): DashboardConfig {
    return this.createDefaultConfig(userRole);
  }

  /**
   * Validate configuration
   */
  static validateConfig(config: DashboardConfig): boolean {
    if (!Array.isArray(config.widgets)) {
      return false;
    }

    return config.widgets.every((w) => {
      return (
        w.id &&
        w.type &&
        w.title &&
        w.position !== undefined &&
        w.enabled !== undefined &&
        w.size
      );
    });
  }
}
