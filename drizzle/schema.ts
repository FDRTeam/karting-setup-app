import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 256 }),
  role: mysqlEnum("role", ["user", "admin", "manager"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Karting setups table for cloud sync
export const kartingSetups = mysqlTable("karting_setups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  setup: text("setup").notNull(),
  trackName: varchar("trackName", { length: 255 }).notNull(),
  kartNumber: varchar("kartNumber", { length: 50 }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KartingSetup = typeof kartingSetups.$inferSelect;
export type InsertKartingSetup = typeof kartingSetups.$inferInsert;

// Setup sharing table for users to share setups with each other
export const setupShares = mysqlTable("setup_shares", {
  id: int("id").autoincrement().primaryKey(),
  setupId: int("setupId").notNull(),
  ownerId: int("ownerId").notNull(),
  sharedWithUserId: int("sharedWithUserId").notNull(),
  permission: mysqlEnum("permission", ["view"]).default("view").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SetupShare = typeof setupShares.$inferSelect;
export type InsertSetupShare = typeof setupShares.$inferInsert;

// Issues table for manager to track and fix issues
export const issues = mysqlTable("issues", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  reportedByUserId: int("reportedByUserId").notNull(),
  assignedToManagerId: int("assignedToManagerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = typeof issues.$inferInsert;

// Notifications table for real-time alerts
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["issue_created", "issue_assigned", "issue_resolved", "anomaly_detected", "user_joined"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityId: int("relatedEntityId"),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Dashboard preferences table for customizable widgets
export const dashboardPreferences = mysqlTable("dashboard_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  widgets: text("widgets").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardPreference = typeof dashboardPreferences.$inferSelect;
export type InsertDashboardPreference = typeof dashboardPreferences.$inferInsert;
