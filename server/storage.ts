import {
  users,
  projects,
  rsvps,
  messages,
  notifications,
  userBadges,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ProjectWithDetails,
  type InsertRsvp,
  type Rsvp,
  type InsertMessage,
  type Message,
  type InsertNotification,
  type Notification,
  type UserWithStats,
  type InsertUserBadge,
  type UserBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;
  
  // Project operations
  getProjects(filters?: { category?: string; search?: string; userId?: string }): Promise<ProjectWithDetails[]>;
  getProject(id: string): Promise<ProjectWithDetails | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getUserProjects(userId: string): Promise<Project[]>;
  
  // RSVP operations
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getUserRsvps(userId: string): Promise<(Rsvp & { project: Project })[]>;
  getProjectRsvps(projectId: string): Promise<(Rsvp & { user: User })[]>;
  deleteRsvp(projectId: string, userId: string): Promise<void>;
  
  // Message operations
  getProjectMessages(projectId: string): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  
  // Badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(badge: InsertUserBadge): Promise<UserBadge>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        location: users.location,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        organizedProjectsCount: sql<number>`(
          SELECT COUNT(*) FROM ${projects} WHERE ${projects.organizerId} = ${users.id}
        )`,
        rsvpsCount: sql<number>`(
          SELECT COUNT(*) FROM ${rsvps} WHERE ${rsvps.userId} = ${users.id}
        )`,
        badgesCount: sql<number>`(
          SELECT COUNT(*) FROM ${userBadges} WHERE ${userBadges.userId} = ${users.id}
        )`,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) return undefined;

    const badges = await this.getUserBadges(id);

    return {
      ...user,
      _count: {
        organizedProjects: user.organizedProjectsCount,
        rsvps: user.rsvpsCount,
        badges: user.badgesCount,
      },
      badges,
    } as UserWithStats;
  }

  async getProjects(filters?: { category?: string; search?: string; userId?: string }): Promise<ProjectWithDetails[]> {
    let query = db
      .select({
        project: projects,
        organizer: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.organizerId, users.id))
      .where(eq(projects.isActive, true))
      .orderBy(desc(projects.createdAt));

    if (filters?.category && filters.category !== 'all') {
      query = query.where(and(
        eq(projects.isActive, true),
        eq(projects.category, filters.category as any)
      ));
    }

    if (filters?.search) {
      query = query.where(and(
        eq(projects.isActive, true),
        or(
          ilike(projects.title, `%${filters.search}%`),
          ilike(projects.description, `%${filters.search}%`),
          ilike(projects.location, `%${filters.search}%`)
        )
      ));
    }

    if (filters?.userId) {
      query = query.where(and(
        eq(projects.isActive, true),
        eq(projects.organizerId, filters.userId)
      ));
    }

    const results = await query;

    // Get RSVPs for each project
    const projectsWithDetails = await Promise.all(
      results.map(async (result) => {
        const projectRsvps = await db
          .select({
            rsvp: rsvps,
            user: users,
          })
          .from(rsvps)
          .leftJoin(users, eq(rsvps.userId, users.id))
          .where(eq(rsvps.projectId, result.project.id));

        return {
          ...result.project,
          organizer: result.organizer!,
          rsvps: projectRsvps.map(pr => ({ ...pr.rsvp, user: pr.user! })),
          _count: {
            rsvps: projectRsvps.length,
          },
        };
      })
    );

    return projectsWithDetails;
  }

  async getProject(id: string): Promise<ProjectWithDetails | undefined> {
    const [result] = await db
      .select({
        project: projects,
        organizer: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.organizerId, users.id))
      .where(eq(projects.id, id));

    if (!result) return undefined;

    const projectRsvps = await db
      .select({
        rsvp: rsvps,
        user: users,
      })
      .from(rsvps)
      .leftJoin(users, eq(rsvps.userId, users.id))
      .where(eq(rsvps.projectId, id));

    return {
      ...result.project,
      organizer: result.organizer!,
      rsvps: projectRsvps.map(pr => ({ ...pr.rsvp, user: pr.user! })),
      _count: {
        rsvps: projectRsvps.length,
      },
    };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.update(projects).set({ isActive: false }).where(eq(projects.id, id));
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.organizerId, userId), eq(projects.isActive, true)))
      .orderBy(desc(projects.createdAt));
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const [created] = await db.insert(rsvps).values(rsvp).returning();
    return created;
  }

  async getUserRsvps(userId: string): Promise<(Rsvp & { project: Project })[]> {
    const results = await db
      .select({
        rsvp: rsvps,
        project: projects,
      })
      .from(rsvps)
      .leftJoin(projects, eq(rsvps.projectId, projects.id))
      .where(eq(rsvps.userId, userId))
      .orderBy(desc(rsvps.createdAt));

    return results.map(r => ({ ...r.rsvp, project: r.project! }));
  }

  async getProjectRsvps(projectId: string): Promise<(Rsvp & { user: User })[]> {
    const results = await db
      .select({
        rsvp: rsvps,
        user: users,
      })
      .from(rsvps)
      .leftJoin(users, eq(rsvps.userId, users.id))
      .where(eq(rsvps.projectId, projectId));

    return results.map(r => ({ ...r.rsvp, user: r.user! }));
  }

  async deleteRsvp(projectId: string, userId: string): Promise<void> {
    await db
      .delete(rsvps)
      .where(and(eq(rsvps.projectId, projectId), eq(rsvps.userId, userId)));
  }

  async getProjectMessages(projectId: string): Promise<(Message & { sender: User })[]> {
    const results = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.projectId, projectId))
      .orderBy(messages.createdAt);

    return results.map(r => ({ ...r.message, sender: r.sender! }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(badge: InsertUserBadge): Promise<UserBadge> {
    const [created] = await db.insert(userBadges).values(badge).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
