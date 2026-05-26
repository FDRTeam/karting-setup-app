import crypto from "crypto";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { COOKIE_NAME } from "../constants/const";

// Hash password using SHA256
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    emailSignup: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const existingUser = await db.getUserByEmail(input.email);
          if (existingUser) {
            return {
              success: false,
              error: "Email already registered",
            } as const;
          }
          const passwordHash = hashPassword(input.password);
          await db.upsertUser({
            email: input.email,
            name: input.name || null,
            passwordHash,
            loginMethod: "email",
            lastSignedIn: new Date(),
          });
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            return {
              success: false,
              error: "Failed to create user",
            } as const;
          }
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, String(user.id), cookieOptions);
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          } as const;
        } catch (error) {
          console.error("[API] Signup error:", error);
          return {
            success: false,
            error: "Signup failed",
          } as const;
        }
      }),
    emailLogin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            return {
              success: false,
              error: "Invalid email or password",
            } as const;
          }
          if (!user.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
            return {
              success: false,
              error: "Invalid email or password",
            } as const;
          }
          await db.upsertUser({
            id: user.id,
            email: user.email,
            lastSignedIn: new Date(),
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, String(user.id), cookieOptions);
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          } as const;
        } catch (error) {
          console.error("[API] Login error:", error);
          return {
            success: false,
            error: "Login failed",
          } as const;
        }
      }),
  }),

  setup: router({
    // Save a setup (protected - requires authentication)
    save: protectedProcedure
      .input(
        z.object({
          setup: z.string(),
          trackName: z.string(),
          date: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const setupId = await db.saveKartingSetup(
            ctx.user.id,
            input.setup,
            input.trackName,
            new Date(input.date)
          );
          return {
            success: true,
            data: { id: setupId },
          } as const;
        } catch (error) {
          console.error("[API] Error saving setup:", error);
          return {
            success: false,
            error: "Failed to save setup",
          } as const;
        }
      }),

    // Get user's own setups (protected - requires authentication)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        const setups = await db.getKartingSetupsByUser(ctx.user.id);
        return {
          success: true,
          data: setups,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching setups:", error);
        return {
          success: false,
          error: "Failed to fetch setups",
          data: [],
        } as const;
      }
    }),

    // Get a specific setup (protected - requires authentication, user can only access own setups)
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        try {
          const setupId = parseInt(input.id, 10);
          const setup = await db.getKartingSetupById(setupId, ctx.user.id);
          if (!setup) {
            return {
              success: false,
              error: "Setup not found",
              data: null,
            } as const;
          }
          return {
            success: true,
            data: setup,
          } as const;
        } catch (error) {
          console.error("[API] Error fetching setup:", error);
          return {
            success: false,
            error: "Failed to fetch setup",
            data: null,
          } as const;
        }
      }),

    // Delete a setup (protected - requires authentication, user can only delete own setups)
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const setupId = parseInt(input.id, 10);
          const success = await db.deleteKartingSetup(setupId, ctx.user.id);
          if (!success) {
            return {
              success: false,
              error: "Setup not found",
            } as const;
          }
          return {
            success: true,
          } as const;
        } catch (error) {
          console.error("[API] Error deleting setup:", error);
          return {
            success: false,
            error: "Failed to delete setup",
          } as const;
        }
      }),

    // Admin-only: Get all setups from all users
    getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
      try {
        // Check if user is admin
        if (ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: admin access required",
            data: [],
          } as const;
        }

        const allSetups = await db.getAllKartingSetups();
        return {
          success: true,
          data: allSetups,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching all setups:", error);
        return {
          success: false,
          error: "Failed to fetch setups",
          data: [],
        } as const;
      }
    }),

    // Admin-only: Get setups for a specific user
    getUserSetupsAdmin: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          // Check if user is admin
          if (ctx.user?.role !== "admin") {
            return {
              success: false,
              error: "Unauthorized: admin access required",
              data: [],
            } as const;
          }

          const setups = await db.getKartingSetupsByUser(input.userId);
          return {
            success: true,
            data: setups,
          } as const;
        } catch (error) {
          console.error("[API] Error fetching user setups:", error);
          return {
            success: false,
            error: "Failed to fetch setups",
            data: [],
          } as const;
        }
      }),

    // Share a setup with another user
    share: protectedProcedure
      .input(z.object({ setupId: z.number(), sharedWithEmail: z.string().optional(), sharedWithPhone: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        try {
          let sharedWithUser = null;
          if (input.sharedWithEmail) {
            sharedWithUser = await db.getUserByEmail(input.sharedWithEmail);
          } else if (input.sharedWithPhone) {
            sharedWithUser = await db.getUserByPhone(input.sharedWithPhone);
          }

          if (!sharedWithUser) {
            return {
              success: false,
              error: "User not found",
            } as const;
          }

          await db.shareSetup(input.setupId, ctx.user.id, sharedWithUser.id);
          return {
            success: true,
          } as const;
        } catch (error) {
          console.error("[API] Error sharing setup:", error);
          return {
            success: false,
            error: "Failed to share setup",
          } as const;
        }
      }),

    // Get setups shared with the user
    getShared: protectedProcedure.query(async ({ ctx }) => {
      try {
        const shares = await db.getSharedSetups(ctx.user.id);
        return {
          success: true,
          data: shares,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching shared setups:", error);
        return {
          success: false,
          error: "Failed to fetch shared setups",
          data: [],
        } as const;
      }
    }),
  }),

  // Issues router for reporting and tracking problems
  issues: router({
    create: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), priority: z.enum(["low", "medium", "high"]) }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.createIssue(input.title, input.description, input.priority, ctx.user.id);
          return {
            success: true,
          } as const;
        } catch (error) {
          console.error("[API] Error creating issue:", error);
          return {
            success: false,
            error: "Failed to create issue",
          } as const;
        }
      }),

    // Manager-only: Get all issues
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user?.role !== "manager" && ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: manager or admin access required",
            data: [],
          } as const;
        }

        const allIssues = await db.getIssues();
        return {
          success: true,
          data: allIssues,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching issues:", error);
        return {
          success: false,
          error: "Failed to fetch issues",
          data: [],
        } as const;
      }
    }),

    // Manager-only: Update issue status
    updateStatus: protectedProcedure
      .input(z.object({ issueId: z.number(), status: z.enum(["open", "in_progress", "resolved", "closed"]) }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (ctx.user?.role !== "manager" && ctx.user?.role !== "admin") {
            return {
              success: false,
              error: "Unauthorized: manager or admin access required",
            } as const;
          }

          await db.updateIssueStatus(input.issueId, input.status, ctx.user.id);
          return {
            success: true,
          } as const;
        } catch (error) {
          console.error("[API] Error updating issue:", error);
          return {
            success: false,
            error: "Failed to update issue",
          } as const;
        }
      }),
  }),

  // Analytics router for admin insights
  analytics: router({
    // Admin-only: Get setups by track
    setupsByTrack: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: admin access required",
            data: [],
          } as const;
        }

        const data = await db.getSetupsByTrack();
        return {
          success: true,
          data,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching setups by track:", error);
        return {
          success: false,
          error: "Failed to fetch data",
          data: [],
        } as const;
      }
    }),

    // Admin-only: Get user activity metrics
    userActivity: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: admin access required",
            data: null,
          } as const;
        }

        const data = await db.getUserActivityMetrics();
        return {
          success: true,
          data,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching user activity:", error);
        return {
          success: false,
          error: "Failed to fetch data",
          data: null,
        } as const;
      }
    }),

    // Admin-only: Get setup trends by date
    setupTrends: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input, ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            return {
              success: false,
              error: "Unauthorized: admin access required",
              data: [],
            } as const;
          }

          const data = await db.getSetupTrendsByDate(input.days);
          return {
            success: true,
            data,
          } as const;
        } catch (error) {
          console.error("[API] Error fetching setup trends:", error);
          return {
            success: false,
            error: "Failed to fetch data",
            data: [],
          } as const;
        }
      }),

    // Admin-only: Get top users
    topUsers: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input, ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            return {
              success: false,
              error: "Unauthorized: admin access required",
              data: [],
            } as const;
          }

          const data = await db.getTopUsers(input.limit);
          return {
            success: true,
            data,
          } as const;
        } catch (error) {
          console.error("[API] Error fetching top users:", error);
          return {
            success: false,
            error: "Failed to fetch data",
            data: [],
          } as const;
        }
      }),

    // Admin-only: Get setups by kart number
    setupsByKart: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: admin access required",
            data: [],
          } as const;
        }

        const data = await db.getSetupsByKartNumber();
        return {
          success: true,
          data,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching setups by kart:", error);
        return {
          success: false,
          error: "Failed to fetch data",
          data: [],
        } as const;
      }
    }),
  }),

  // Notifications router
  notifications: router({
    // Get user notifications
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        const data = await db.getUserNotifications(ctx.user.id);
        return {
          success: true,
          data,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching notifications:", error);
        return {
          success: false,
          error: "Failed to fetch notifications",
          data: [],
        } as const;
      }
    }),

    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const success = await db.markNotificationAsRead(input.notificationId);
          return { success } as const;
        } catch (error) {
          console.error("[API] Error marking notification as read:", error);
          return { success: false } as const;
        }
      }),
  }),

  // Dashboard router
  dashboard: router({
    // Get dashboard preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      try {
        const data = await db.getDashboardPreferences(ctx.user.id);
        return {
          success: true,
          data,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching dashboard preferences:", error);
        return {
          success: false,
          error: "Failed to fetch preferences",
          data: null,
        } as const;
      }
    }),

    // Save dashboard preferences
    savePreferences: protectedProcedure
      .input(z.object({ widgets: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await db.saveDashboardPreferences(ctx.user.id, input.widgets);
          return { success } as const;
        } catch (error) {
          console.error("[API] Error saving dashboard preferences:", error);
          return { success: false } as const;
        }
      }),
  }),

  // User management router (admin-only)
  users: router({
    // Get all users (admin-only)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: admin access required",
            data: [],
          } as const;
        }

        const users = await db.getAllUsers();
        return {
          success: true,
          data: users,
        } as const;
      } catch (error) {
        console.error("[API] Error fetching users:", error);
        return {
          success: false,
          error: "Failed to fetch users",
          data: [],
        } as const;
      }
    }),

    // Update user role (admin-only)
    updateRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "manager", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            return {
              success: false,
              error: "Unauthorized: admin access required",
            } as const;
          }

          await db.updateUserRole(input.userId, input.role);
          return {
            success: true,
          } as const;
        } catch (error) {
          console.error("[API] Error updating user role:", error);
          return {
            success: false,
            error: "Failed to update user role",
          } as const;
        }
      }),
   }),
  weather: router({
    fetchWeather: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
        })
      )
      .query(async ({ input }) => {
        console.log("[Weather] Fetching from wttr.in for:", input.latitude, input.longitude);
        try {
          // Use wttr.in API which works reliably and requires no API key
          const response = await fetch(
            `https://wttr.in/${input.latitude},${input.longitude}?format=j1`,
            { 
              headers: { 'User-Agent': 'KartingSetupApp/1.0' }
            }
          );

          if (!response.ok) {
            throw new Error(`wttr.in API error: ${response.status}`);
          }

          const data = await response.json();
          const current = data.current_condition[0];

          // Get temperature values
          const tempC = parseFloat(current.temp_C);
          const tempF = parseFloat(current.temp_F);
          
          // Estimate track asphalt temperature (typically 10-15°F warmer than air temp)
          const estimatedAsphaltTempF = tempF + 10;

          console.log("[Weather] Successfully fetched from wttr.in - Temp:", tempF + "°F, Conditions:", current.weatherDesc[0].value);

          return {
            success: true,
            data: {
              temperature: tempC, // Celsius
              humidity: parseInt(current.humidity), // Percentage
              windSpeed: parseInt(current.windspeedMiles), // mph
              windDirection: parseInt(current.winddirDegree), // degrees
              trackAsphaltTemp: Math.round(estimatedAsphaltTempF * 10) / 10, // Fahrenheit
              conditions: current.weatherDesc[0].value, // e.g., "Overcast", "Partly cloudy"
              timestamp: new Date().toISOString(),
              isEstimated: false,
            },
          } as const;
        } catch (error) {
          console.error("[Weather] Error fetching from wttr.in:", error);
          
          // Fallback: Return reasonable estimated weather data
          console.log("[Weather] Using fallback weather data");
          
          // Return reasonable fallback values when API fails
          const estimatedAsphaltTemp = 15; // ~59°F in Fahrenheit
          
          return {
            success: true,
            data: {
              temperature: 15, // ~59°F in Celsius
              humidity: 65,
              windSpeed: 12, // mph
              windDirection: 180, // South
              trackAsphaltTemp: Math.round(estimatedAsphaltTemp * 10) / 10,
              conditions: "Estimated - API unavailable",
              timestamp: new Date().toISOString(),
              isEstimated: true, // Flag to indicate this is fallback data
            },
          } as const;
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
