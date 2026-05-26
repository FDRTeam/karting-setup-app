import { describe, it, expect } from "vitest";
import { ReportGenerator, ReportData } from "../services/report-generator";
import { DashboardWidgetManager, AVAILABLE_WIDGETS } from "../services/dashboard-widgets";

describe("Report Generator", () => {
  const mockReportData: ReportData = {
    title: "Test Report",
    generatedAt: new Date().toISOString(),
    metrics: {
      totalSetups: 100,
      totalUsers: 20,
      activeUsers: 15,
      averageSetupsPerUser: 5,
    },
    setupsByTrack: [
      { track: "Autobahn", count: 60, percentage: 60 },
      { track: "National", count: 40, percentage: 40 },
    ],
    setupsByKart: [
      { kart: "K-1", count: 50, percentage: 50 },
      { kart: "K-2", count: 50, percentage: 50 },
    ],
    topUsers: [
      { userId: 1, userName: "Alice", setupCount: 30, percentage: 30 },
      { userId: 2, userName: "Bob", setupCount: 20, percentage: 20 },
    ],
    trends: [
      { date: "2026-01-01", count: 5 },
      { date: "2026-01-02", count: 10 },
    ],
  };

  describe("generateTextReport", () => {
    it("should generate text report with all sections", () => {
      const report = ReportGenerator.generateTextReport(mockReportData);

      expect(report).toContain("Test Report");
      expect(report).toContain("KEY METRICS");
      expect(report).toContain("Total Setups:              100");
      expect(report).toContain("SETUPS BY TRACK");
      expect(report).toContain("Autobahn");
      expect(report).toContain("SETUPS BY KART");
      expect(report).toContain("K-1");
      expect(report).toContain("TOP USERS");
      expect(report).toContain("Alice");
    });

    it("should include metrics in text report", () => {
      const report = ReportGenerator.generateTextReport(mockReportData);

      expect(report).toContain("Total Users:               20");
      expect(report).toContain("Active Users:              15");
      expect(report).toContain("Avg Setups per User:       5.00");
    });
  });

  describe("generateCSVReport", () => {
    it("should generate CSV report with proper format", () => {
      const report = ReportGenerator.generateCSVReport(mockReportData);

      expect(report).toContain("KARTING SETUP ANALYTICS REPORT");
      expect(report).toContain("KEY METRICS");
      expect(report).toContain("Metric,Value");
      expect(report).toContain("Total Setups,100");
      expect(report).toContain("Track,Count,Percentage");
      expect(report).toContain("Autobahn,60,60%");
    });

    it("should include all data sections in CSV", () => {
      const report = ReportGenerator.generateCSVReport(mockReportData);

      expect(report).toContain("SETUPS BY TRACK");
      expect(report).toContain("SETUPS BY KART");
      expect(report).toContain("TOP USERS");
      expect(report).toContain("Rank,User Name,Setup Count,Percentage");
    });
  });

  describe("generateJSONReport", () => {
    it("should generate valid JSON report", () => {
      const report = ReportGenerator.generateJSONReport(mockReportData);
      const parsed = JSON.parse(report);

      expect(parsed.title).toBe("Test Report");
      expect(parsed.metrics.totalSetups).toBe(100);
      expect(parsed.setupsByTrack).toHaveLength(2);
    });
  });

  describe("exportAsBase64", () => {
    it("should encode content as base64", () => {
      const content = "Hello World";
      const encoded = ReportGenerator.exportAsBase64(content, "text");

      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe("string");
    });
  });
});

describe("Dashboard Widget Manager", () => {
  describe("createDefaultConfig", () => {
    it("should create admin default config with analytics widgets", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");

      expect(config.widgets).toBeDefined();
      expect(config.widgets.length).toBeGreaterThan(0);
      expect(config.widgets.some((w) => w.type === "total_setups")).toBe(true);
      expect(config.widgets.some((w) => w.type === "setup_trends")).toBe(true);
    });

    it("should create manager default config with issue widgets", () => {
      const config = DashboardWidgetManager.createDefaultConfig("manager");

      expect(config.widgets).toBeDefined();
      expect(config.widgets.some((w) => w.type === "open_issues")).toBe(true);
    });

    it("should create user default config with basic widgets", () => {
      const config = DashboardWidgetManager.createDefaultConfig("user");

      expect(config.widgets).toBeDefined();
      expect(config.widgets.length).toBeGreaterThan(0);
    });
  });

  describe("parseConfig", () => {
    it("should parse valid JSON config", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const json = JSON.stringify(config);
      const parsed = DashboardWidgetManager.parseConfig(json);

      expect(parsed).toBeTruthy();
      expect(parsed?.widgets).toHaveLength(config.widgets.length);
    });

    it("should return null for invalid JSON", () => {
      const parsed = DashboardWidgetManager.parseConfig("invalid json");
      expect(parsed).toBeNull();
    });
  });

  describe("serializeConfig", () => {
    it("should serialize config to JSON string", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const json = DashboardWidgetManager.serializeConfig(config);

      expect(typeof json).toBe("string");
      expect(JSON.parse(json)).toBeTruthy();
    });
  });

  describe("getEnabledWidgets", () => {
    it("should return only enabled widgets sorted by position", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      config.widgets[0].enabled = false;

      const enabled = DashboardWidgetManager.getEnabledWidgets(config);

      expect(enabled.every((w) => w.enabled)).toBe(true);
      expect(enabled[0].position).toBeLessThan(enabled[1].position);
    });
  });

  describe("addWidget", () => {
    it("should add new widget to config", () => {
      const config = DashboardWidgetManager.createDefaultConfig("user");
      const initialCount = config.widgets.length;

      const updated = DashboardWidgetManager.addWidget(config, "setup_trends");

      expect(updated.widgets.length).toBe(initialCount + 1);
      expect(updated.widgets.some((w) => w.type === "setup_trends")).toBe(true);
    });

    it("should not add duplicate widgets", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const initialCount = config.widgets.length;

      const updated = DashboardWidgetManager.addWidget(config, "total_setups");

      expect(updated.widgets.length).toBe(initialCount);
    });
  });

  describe("removeWidget", () => {
    it("should remove widget from config", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const widgetToRemove = config.widgets[0];

      const updated = DashboardWidgetManager.removeWidget(config, widgetToRemove.id);

      expect(updated.widgets.some((w) => w.id === widgetToRemove.id)).toBe(false);
    });
  });

  describe("toggleWidget", () => {
    it("should toggle widget enabled state", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const widget = config.widgets[0];
      const initialState = widget.enabled;

      const updated = DashboardWidgetManager.toggleWidget(config, widget.id);
      const toggledWidget = updated.widgets.find((w) => w.id === widget.id);

      expect(toggledWidget?.enabled).toBe(!initialState);
    });
  });

  describe("reorderWidgets", () => {
    it("should reorder widgets by provided IDs", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const ids = config.widgets.map((w) => w.id).reverse();

      const updated = DashboardWidgetManager.reorderWidgets(config, ids);

      expect(updated.widgets[0].id).toBe(ids[0]);
      expect(updated.widgets[updated.widgets.length - 1].id).toBe(ids[ids.length - 1]);
    });
  });

  describe("resetToDefault", () => {
    it("should reset to default admin config", () => {
      const config = DashboardWidgetManager.resetToDefault("admin");

      expect(config.widgets).toBeDefined();
      expect(config.widgets.length).toBeGreaterThan(0);
      expect(config.widgets.every((w) => w.enabled)).toBe(true);
    });
  });

  describe("validateConfig", () => {
    it("should validate correct config", () => {
      const config = DashboardWidgetManager.createDefaultConfig("admin");
      const isValid = DashboardWidgetManager.validateConfig(config);

      expect(isValid).toBe(true);
    });

    it("should reject invalid config", () => {
      const invalidConfig = { widgets: [{ id: "test" }] } as any;
      const isValid = DashboardWidgetManager.validateConfig(invalidConfig);

      expect(isValid).toBe(false);
    });
  });

  describe("AVAILABLE_WIDGETS", () => {
    it("should have all required widget types", () => {
      expect(AVAILABLE_WIDGETS.total_setups).toBeTruthy();
      expect(AVAILABLE_WIDGETS.active_users).toBeTruthy();
      expect(AVAILABLE_WIDGETS.open_issues).toBeTruthy();
      expect(AVAILABLE_WIDGETS.setup_trends).toBeTruthy();
    });

    it("should have valid widget properties", () => {
      Object.values(AVAILABLE_WIDGETS).forEach((widget) => {
        expect(widget.id).toBeTruthy();
        expect(widget.type).toBeTruthy();
        expect(widget.title).toBeTruthy();
        expect(widget.description).toBeTruthy();
        expect(["small", "medium", "large"]).toContain(widget.size);
      });
    });
  });
});
