import { db } from "./db";
import {
  users,
  sessions,
  wardrobeItems,
  outfits,
  tryonJobs,
  contentJobs,
  usageCredits,
  feedback,
  events,
  imageMetadata,
  subscriptions,
  affiliateClicks,
  skinSnapshots,
  type User,
  type InsertUser,
  type WardrobeItem,
  type InsertWardrobeItem,
  type Outfit,
  type InsertOutfit,
  type TryonJob,
  type ContentJob,
  type Feedback,
  type Event,
  type ImageMetadata,
  type Subscription,
  type AffiliateClick,
  type SkinSnapshotRecord,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  createGuestUser(): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  createSession(userId: string): Promise<{ token: string; expiresAt: Date }>;
  getSessionByToken(token: string): Promise<{ userId: string } | undefined>;

  getWardrobeItems(userId: string): Promise<WardrobeItem[]>;
  getWardrobeItem(id: string, userId: string): Promise<WardrobeItem | undefined>;
  createWardrobeItem(data: InsertWardrobeItem): Promise<WardrobeItem>;
  updateWardrobeItem(id: string, userId: string, data: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined>;
  deleteWardrobeItem(id: string, userId: string): Promise<boolean>;

  getOutfits(userId: string): Promise<Outfit[]>;
  getOutfit(id: string, userId: string): Promise<Outfit | undefined>;
  createOutfit(data: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: string, userId: string, data: Partial<InsertOutfit>): Promise<Outfit | undefined>;
  deleteOutfit(id: string, userId: string): Promise<boolean>;

  createTryonJob(userId: string, selfieUrl: string, garmentItemIds: string[]): Promise<TryonJob>;
  getTryonJob(id: string, userId: string): Promise<TryonJob | undefined>;
  updateTryonJob(id: string, data: Partial<TryonJob>): Promise<TryonJob | undefined>;

  createContentJob(userId: string, outfitId: string, tone?: string, platform?: string): Promise<ContentJob>;
  getContentJob(id: string, userId: string): Promise<ContentJob | undefined>;
  updateContentJob(id: string, data: Partial<ContentJob>): Promise<ContentJob | undefined>;

  getCredits(userId: string): Promise<number>;
  consumeCredits(userId: string, amount: number): Promise<boolean>;

  markItemAsWorn(id: string, userId: string): Promise<WardrobeItem | undefined>;
  getWardrobeStats(userId: string): Promise<{ totalItems: number; wornItems: number; utilizationPct: number }>;

  createFeedback(userId: string, outfitId: string, rating: number, comment?: string): Promise<Feedback>;
  trackEvent(userId: string, eventType: string, eventData?: Record<string, any>): Promise<Event>;

  getSubscription(userId: string): Promise<Subscription | undefined>;
  createOrUpdateSubscription(userId: string, tier: string, monthlyCredits: number): Promise<Subscription>;
  consumeSubscriptionCredit(userId: string): Promise<{ allowed: boolean; remaining: number }>;
  getAnalytics(userId: string): Promise<any>;

  trackAffiliateClick(userId: string, productName: string, productUrl: string, source: string): Promise<AffiliateClick>;
  createSkinSnapshot(data: Omit<SkinSnapshotRecord, "id" | "createdAt">): Promise<SkinSnapshotRecord>;
  getSkinSnapshots(userId: string): Promise<SkinSnapshotRecord[]>;
  getSkinSnapshot(id: string, userId: string): Promise<SkinSnapshotRecord | undefined>;
  deleteSkinSnapshot(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createGuestUser(): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        isGuest: true,
        authProvider: "guest",
        displayName: "Guest User",
      })
      .returning();

    await db.insert(usageCredits).values({ userId: user.id, credits: 100 });
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({ userId, token, expiresAt });
    return { token, expiresAt };
  }

  async getSessionByToken(token: string): Promise<{ userId: string } | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    if (!session || session.expiresAt < new Date()) return undefined;
    return { userId: session.userId };
  }

  async getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
    return db
      .select()
      .from(wardrobeItems)
      .where(eq(wardrobeItems.userId, userId))
      .orderBy(desc(wardrobeItems.createdAt));
  }

  async getWardrobeItem(id: string, userId: string): Promise<WardrobeItem | undefined> {
    const [item] = await db
      .select()
      .from(wardrobeItems)
      .where(and(eq(wardrobeItems.id, id), eq(wardrobeItems.userId, userId)));
    return item;
  }

  async createWardrobeItem(data: InsertWardrobeItem): Promise<WardrobeItem> {
    const [item] = await db.insert(wardrobeItems).values(data).returning();
    return item;
  }

  async updateWardrobeItem(
    id: string,
    userId: string,
    data: Partial<InsertWardrobeItem>,
  ): Promise<WardrobeItem | undefined> {
    const [item] = await db
      .update(wardrobeItems)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(wardrobeItems.id, id), eq(wardrobeItems.userId, userId)))
      .returning();
    return item;
  }

  async deleteWardrobeItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(wardrobeItems)
      .where(and(eq(wardrobeItems.id, id), eq(wardrobeItems.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getOutfits(userId: string): Promise<Outfit[]> {
    return db
      .select()
      .from(outfits)
      .where(eq(outfits.userId, userId))
      .orderBy(desc(outfits.createdAt));
  }

  async getOutfit(id: string, userId: string): Promise<Outfit | undefined> {
    const [outfit] = await db
      .select()
      .from(outfits)
      .where(and(eq(outfits.id, id), eq(outfits.userId, userId)));
    return outfit;
  }

  async createOutfit(data: InsertOutfit): Promise<Outfit> {
    const [outfit] = await db.insert(outfits).values(data).returning();
    return outfit;
  }

  async updateOutfit(
    id: string,
    userId: string,
    data: Partial<InsertOutfit>,
  ): Promise<Outfit | undefined> {
    const [outfit] = await db
      .update(outfits)
      .set(data)
      .where(and(eq(outfits.id, id), eq(outfits.userId, userId)))
      .returning();
    return outfit;
  }

  async deleteOutfit(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(outfits)
      .where(and(eq(outfits.id, id), eq(outfits.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async createTryonJob(
    userId: string,
    selfieUrl: string,
    garmentItemIds: string[],
  ): Promise<TryonJob> {
    const [job] = await db
      .insert(tryonJobs)
      .values({ userId, selfieUrl, garmentItemIds, status: "queued" })
      .returning();
    return job;
  }

  async getTryonJob(id: string, userId: string): Promise<TryonJob | undefined> {
    const [job] = await db
      .select()
      .from(tryonJobs)
      .where(and(eq(tryonJobs.id, id), eq(tryonJobs.userId, userId)));
    return job;
  }

  async updateTryonJob(id: string, data: Partial<TryonJob>): Promise<TryonJob | undefined> {
    const [job] = await db
      .update(tryonJobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tryonJobs.id, id))
      .returning();
    return job;
  }

  async createContentJob(
    userId: string,
    outfitId: string,
    tone?: string,
    platform?: string,
  ): Promise<ContentJob> {
    const [job] = await db
      .insert(contentJobs)
      .values({ userId, outfitId, tone, platform, status: "queued" })
      .returning();
    return job;
  }

  async getContentJob(id: string, userId: string): Promise<ContentJob | undefined> {
    const [job] = await db
      .select()
      .from(contentJobs)
      .where(and(eq(contentJobs.id, id), eq(contentJobs.userId, userId)));
    return job;
  }

  async updateContentJob(
    id: string,
    data: Partial<ContentJob>,
  ): Promise<ContentJob | undefined> {
    const [job] = await db
      .update(contentJobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contentJobs.id, id))
      .returning();
    return job;
  }

  async getCredits(userId: string): Promise<number> {
    const [row] = await db
      .select()
      .from(usageCredits)
      .where(eq(usageCredits.userId, userId));
    return row?.credits ?? 0;
  }

  async consumeCredits(userId: string, amount: number): Promise<boolean> {
    const credits = await this.getCredits(userId);
    if (credits < amount) return false;

    await db
      .update(usageCredits)
      .set({ credits: credits - amount, updatedAt: new Date() })
      .where(eq(usageCredits.userId, userId));
    return true;
  }

  async markItemAsWorn(id: string, userId: string): Promise<WardrobeItem | undefined> {
    const [item] = await db
      .update(wardrobeItems)
      .set({
        usageCount: sql`COALESCE(${wardrobeItems.usageCount}, 0) + 1`,
        lastWornAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(wardrobeItems.id, id), eq(wardrobeItems.userId, userId)))
      .returning();
    return item;
  }

  async getWardrobeStats(userId: string): Promise<{ totalItems: number; wornItems: number; utilizationPct: number }> {
    const items = await this.getWardrobeItems(userId);
    const totalItems = items.length;
    const wornItems = items.filter(i => (i.usageCount ?? 0) > 0).length;
    const utilizationPct = totalItems > 0 ? Math.round((wornItems / totalItems) * 100) : 0;
    return { totalItems, wornItems, utilizationPct };
  }

  async createFeedback(userId: string, outfitId: string, rating: number, comment?: string): Promise<Feedback> {
    const [fb] = await db
      .insert(feedback)
      .values({ userId, outfitId, rating, comment })
      .returning();
    return fb;
  }

  async trackEvent(userId: string, eventType: string, eventData?: Record<string, any>): Promise<Event> {
    const [evt] = await db
      .insert(events)
      .values({ userId, eventType, eventData })
      .returning();
    return evt;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    return sub;
  }

  async createOrUpdateSubscription(userId: string, tier: string, monthlyCredits: number): Promise<Subscription> {
    const existing = await this.getSubscription(userId);
    if (existing) {
      const [updated] = await db
        .update(subscriptions)
        .set({ tier, monthlyCredits, creditsUsed: 0, updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return updated;
    }
    const [sub] = await db
      .insert(subscriptions)
      .values({ userId, tier, monthlyCredits, creditsUsed: 0 })
      .returning();
    return sub;
  }

  async consumeSubscriptionCredit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    let sub = await this.getSubscription(userId);
    if (!sub) {
      sub = await this.createOrUpdateSubscription(userId, 'free', 25);
    }
    const used = sub.creditsUsed ?? 0;
    const monthly = sub.monthlyCredits ?? 25;
    if (used >= monthly) {
      return { allowed: false, remaining: 0 };
    }
    await db
      .update(subscriptions)
      .set({ creditsUsed: used + 1, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
    return { allowed: true, remaining: monthly - used - 1 };
  }

  async getAnalytics(userId: string): Promise<any> {
    const items = await this.getWardrobeItems(userId);
    const allOutfits = await this.getOutfits(userId);
    const sub = await this.getSubscription(userId);
    const stats = await this.getWardrobeStats(userId);

    const totalTryOns = items.reduce((sum, i) => sum + (i.usageCount ?? 0), 0);
    const categories: Record<string, number> = {};
    items.forEach(i => { categories[i.category] = (categories[i.category] || 0) + 1; });

    return {
      subscription: sub ? { tier: sub.tier, creditsUsed: sub.creditsUsed, monthlyCredits: sub.monthlyCredits } : { tier: 'free', creditsUsed: 0, monthlyCredits: 25 },
      wardrobe: { total: stats.totalItems, worn: stats.wornItems, utilizationPct: stats.utilizationPct },
      outfits: { total: allOutfits.length, saved: allOutfits.filter(o => o.saved).length },
      usage: { totalTryOns, avgPerItem: stats.totalItems > 0 ? Math.round(totalTryOns / stats.totalItems * 10) / 10 : 0 },
      categories,
    };
  }

  async trackAffiliateClick(userId: string, productName: string, productUrl: string, source: string): Promise<AffiliateClick> {
    const [click] = await db
      .insert(affiliateClicks)
      .values({ userId, productName, productUrl, source })
      .returning();
    return click;
  }

  async createSkinSnapshot(data: Omit<SkinSnapshotRecord, "id" | "createdAt">): Promise<SkinSnapshotRecord> {
    const [snapshot] = await db.insert(skinSnapshots).values(data).returning();
    return snapshot;
  }

  async getSkinSnapshots(userId: string): Promise<SkinSnapshotRecord[]> {
    return db.select().from(skinSnapshots)
      .where(eq(skinSnapshots.userId, userId))
      .orderBy(desc(skinSnapshots.createdAt));
  }

  async getSkinSnapshot(id: string, userId: string): Promise<SkinSnapshotRecord | undefined> {
    const [snapshot] = await db.select().from(skinSnapshots)
      .where(and(eq(skinSnapshots.id, id), eq(skinSnapshots.userId, userId)));
    return snapshot;
  }

  async deleteSkinSnapshot(id: string, userId: string): Promise<boolean> {
    const deleted = await db.delete(skinSnapshots)
      .where(and(eq(skinSnapshots.id, id), eq(skinSnapshots.userId, userId)))
      .returning();
    return deleted.length > 0;
  }
}

export const storage = new DatabaseStorage();
