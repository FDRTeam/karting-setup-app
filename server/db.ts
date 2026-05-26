import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, kartingSetups, setupShares, issues, notifications, dashboardPreferences } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  // Support both OAuth (openId) and email/password authentication
  if (!user.openId && !user.email) {
    throw new Error("Either openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {};
    const updateSet: Record<string, unknown> = {};

    // Set unique identifier (openId for OAuth, email for email/password)
    if (user.openId) {
      values.openId = user.openId;
    } else if (user.email) {
      values.email = user.email;
    }

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Karting Setups
export async function saveKartingSetup(
  userId: number,
  setup: string,
  trackName: string,
  date: Date,
  kartNumber?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save setup: database not available");
    return null;
  }

  try {
    await db.insert(kartingSetups).values({
      userId,
      setup,
      trackName,
      date,
      kartNumber,
    });
    return Date.now().toString();
  } catch (error) {
    console.error("[Database] Failed to save setup:", error);
    throw error;
  }
}

export async function getKartingSetupsByUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get setups: database not available");
    return [];
  }

  try {
    return await db.select().from(kartingSetups).where(eq(kartingSetups.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get setups:", error);
    return [];
  }
}

export async function getKartingSetupById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get setup: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(kartingSetups)
      .where(and(eq(kartingSetups.id, id), eq(kartingSetups.userId, userId)))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get setup:", error);
    return null;
  }
}

export async function deleteKartingSetup(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete setup: database not available");
    return false;
  }

  try {
    await db.delete(kartingSetups).where(and(eq(kartingSetups.id, id), eq(kartingSetups.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete setup:", error);
    return false;
  }
}

export async function getAllKartingSetups() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all setups: database not available");
    return [];
  }

  try {
    return await db.select().from(kartingSetups);
  } catch (error) {
    console.error("[Database] Failed to get all setups:", error);
    return [];
  }
}

// Setup Sharing
export async function shareSetup(setupId: number, ownerId: number, sharedWithUserId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot share setup: database not available");
    return null;
  }

  try {
    const result = await db.insert(setupShares).values({
      setupId,
      ownerId,
      sharedWithUserId,
      permission: "view",
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to share setup:", error);
    throw error;
  }
}

export async function getSharedSetups(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get shared setups: database not available");
    return [];
  }

  try {
    return await db.select().from(setupShares).where(eq(setupShares.sharedWithUserId, userId));
  } catch (error) {
    console.error("[Database] Failed to get shared setups:", error);
    return [];
  }
}

export async function removeSetupShare(shareId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot remove share: database not available");
    return false;
  }

  try {
    await db.delete(setupShares).where(eq(setupShares.id, shareId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to remove share:", error);
    return false;
  }
}

// Issues
export async function createIssue(
  title: string,
  description: string | undefined,
  priority: "low" | "medium" | "high",
  reportedByUserId: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create issue: database not available");
    return null;
  }

  try {
    const result = await db.insert(issues).values({
      title,
      description,
      priority,
      reportedByUserId,
      status: "open",
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create issue:", error);
    throw error;
  }
}

export async function getIssues() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get issues: database not available");
    return [];
  }

  try {
    return await db.select().from(issues);
  } catch (error) {
    console.error("[Database] Failed to get issues:", error);
    return [];
  }
}

export async function updateIssueStatus(
  issueId: number,
  status: "open" | "in_progress" | "resolved" | "closed",
  assignedToManagerId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update issue: database not available");
    return false;
  }

  try {
    const updateData: Record<string, unknown> = { status };
    if (assignedToManagerId !== undefined) {
      updateData.assignedToManagerId = assignedToManagerId;
    }
    await db.update(issues).set(updateData).where(eq(issues.id, issueId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update issue:", error);
    return false;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return undefined;
  }
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by phone:", error);
    return undefined;
  }
}

// Analytics
export async function getSetupsByTrack() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get setups by track: database not available");
    return [];
  }

  try {
    const allSetups = await db.select().from(kartingSetups);
    const trackCounts: Record<string, number> = {};
    allSetups.forEach((setup) => {
      trackCounts[setup.trackName] = (trackCounts[setup.trackName] || 0) + 1;
    });
    return Object.entries(trackCounts).map(([track, count]) => ({ track, count }));
  } catch (error) {
    console.error("[Database] Failed to get setups by track:", error);
    return [];
  }
}

export async function getUserActivityMetrics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user activity: database not available");
    return { totalUsers: 0, activeUsers: 0, totalSetups: 0 };
  }

  try {
    const allUsers = await db.select().from(users);
    const allSetups = await db.select().from(kartingSetups);
    
    const userSetupCounts = new Map<number, number>();
    allSetups.forEach((setup) => {
      userSetupCounts.set(setup.userId, (userSetupCounts.get(setup.userId) || 0) + 1);
    });

    const activeUsers = userSetupCounts.size;
    const totalSetups = allSetups.length;

    return {
      totalUsers: allUsers.length,
      activeUsers,
      totalSetups,
      averageSetupsPerUser: activeUsers > 0 ? (totalSetups / activeUsers).toFixed(2) : "0",
    };
  } catch (error) {
    console.error("[Database] Failed to get user activity metrics:", error);
    return { totalUsers: 0, activeUsers: 0, totalSetups: 0 };
  }
}

export async function getSetupTrendsByDate(days: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get setup trends: database not available");
    return [];
  }

  try {
    const allSetups = await db.select().from(kartingSetups);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const trends: Record<string, number> = {};
    allSetups.forEach((setup) => {
      const setupDate = new Date(setup.date);
      if (setupDate >= startDate) {
        const dateKey = setupDate.toISOString().split("T")[0];
        trends[dateKey] = (trends[dateKey] || 0) + 1;
      }
    });

    return Object.entries(trends)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({ date, count }));
  } catch (error) {
    console.error("[Database] Failed to get setup trends:", error);
    return [];
  }
}

export async function getTopUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get top users: database not available");
    return [];
  }

  try {
    const allSetups = await db.select().from(kartingSetups);
    const allUsers = await db.select().from(users);
    
    const userSetupCounts = new Map<number, number>();
    allSetups.forEach((setup) => {
      userSetupCounts.set(setup.userId, (userSetupCounts.get(setup.userId) || 0) + 1);
    });

    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const topUsers = Array.from(userSetupCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([userId, count]) => {
        const user = userMap.get(userId);
        return {
          userId,
          userName: user?.name || `User ${userId}`,
          setupCount: count,
        };
      });

    return topUsers;
  } catch (error) {
    console.error("[Database] Failed to get top users:", error);
    return [];
  }
}

export async function getSetupsByKartNumber() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get setups by kart: database not available");
    return [];
  }

  try {
    const allSetups = await db.select().from(kartingSetups);
    const kartCounts: Record<string, number> = {};
    allSetups.forEach((setup) => {
      const kart = setup.kartNumber || "Unknown";
      kartCounts[kart] = (kartCounts[kart] || 0) + 1;
    });
    return Object.entries(kartCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([kart, count]) => ({ kart, count }));
  } catch (error) {
    console.error("[Database] Failed to get setups by kart:", error);
    return [];
  }
}

// Notifications
export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  relatedEntityId?: number,
  relatedEntityType?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create notification: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(notifications).values({
      userId,
      type: type as any,
      title,
      message,
      relatedEntityId,
      relatedEntityType,
      isRead: 0,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    return undefined;
  }
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get notifications: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark notification as read: database not available");
    return false;
  }

  try {
    await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    return false;
  }
}

// Dashboard Preferences
export async function saveDashboardPreferences(userId: number, widgets: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save dashboard preferences: database not available");
    return false;
  }

  try {
    const existing = await db
      .select()
      .from(dashboardPreferences)
      .where(eq(dashboardPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db.update(dashboardPreferences).set({ widgets }).where(eq(dashboardPreferences.userId, userId));
    } else {
      await db.insert(dashboardPreferences).values({ userId, widgets });
    }
    return true;
  } catch (error) {
    console.error("[Database] Failed to save dashboard preferences:", error);
    return false;
  }
}

export async function getDashboardPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get dashboard preferences: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(dashboardPreferences)
      .where(eq(dashboardPreferences.userId, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get dashboard preferences:", error);
    return null;
  }
}


/**
 * Get all users (admin-only)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const allUsers = await db.select().from(users);
    return allUsers.map((u) => ({
      id: u.id,
      name: u.name || "Unknown",
      email: u.email || "N/A",
      phone: u.phone || "N/A",
      role: u.role || "user",
      createdAt: u.createdAt,
    }));
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    return [];
  }
}

/**
 * Update user role (admin-only)
 */
export async function updateUserRole(userId: number, role: "user" | "manager" | "admin") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    console.log(`[Database] Updated user ${userId} role to ${role}`);
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    throw error;
  }
}


