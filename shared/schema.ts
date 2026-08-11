import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  displayName: text("display_name"),
  authProvider: text("auth_provider").default("guest"),
  isGuest: boolean("is_guest").default(true),
  styleProfile: jsonb("style_profile").$type<{
    colors?: string[];
    styles?: string[];
    fitPrefs?: string[];
  }>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const wardrobeItems = pgTable("wardrobe_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color"),
  brand: text("brand"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  tags: jsonb("tags").$type<string[]>().default([]),
  usageCount: integer("usage_count").default(0),
  lastWornAt: timestamp("last_worn_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const outfits = pgTable("outfits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  itemIds: jsonb("item_ids").$type<string[]>().default([]),
  occasion: text("occasion"),
  tags: jsonb("tags").$type<string[]>().default([]),
  reason: text("reason"),
  explanation: text("explanation"),
  score: numeric("score"),
  saved: boolean("saved").default(false),
  rating: text("rating"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const tryonJobs = pgTable("tryon_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  selfieUrl: text("selfie_url"),
  garmentItemIds: jsonb("garment_item_ids").$type<string[]>().default([]),
  status: text("status").default("queued"),
  resultImageUrl: text("result_image_url"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const contentJobs = pgTable("content_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  outfitId: varchar("outfit_id"),
  status: text("status").default("queued"),
  caption: text("caption"),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  tone: text("tone"),
  platform: text("platform"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const usageCredits = pgTable("usage_credits", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  credits: integer("credits").default(100),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier").notNull().default("free"),
  status: text("status").notNull().default("active"),
  monthlyCredits: integer("monthly_credits").default(25),
  creditsUsed: integer("credits_used").default(0),
  currentPeriodStart: timestamp("current_period_start").default(sql`CURRENT_TIMESTAMP`).notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  externalId: text("external_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productName: text("product_name"),
  productUrl: text("product_url"),
  source: text("source"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const skinSnapshots = pgTable("skin_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  source: text("source").notNull().default("youcam"),
  imageRetention: text("image_retention").notNull().default("not_saved"),
  skinType: text("skin_type"),
  overallSummary: text("overall_summary").notNull(),
  concerns: jsonb("concerns").$type<any[]>().default([]),
  routine: jsonb("routine").$type<any[]>().default([]),
  styleInsights: jsonb("style_insights").$type<any[]>().default([]),
  modelVersion: text("model_version"),
  consentVersion: text("consent_version").notNull().default("skin-v1"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  outfitId: varchar("outfit_id")
    .references(() => outfits.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imageMetadata = pgTable("image_metadata", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  wardrobeItemId: varchar("wardrobe_item_id")
    .notNull()
    .references(() => wardrobeItems.id, { onDelete: "cascade" }),
  dominantColors: jsonb("dominant_colors").$type<string[]>().default([]),
  detectedObjects: jsonb("detected_objects").$type<string[]>().default([]),
  pattern: text("pattern"),
  material: text("material"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  displayName: true,
  authProvider: true,
  isGuest: true,
});

export const insertWardrobeItemSchema = createInsertSchema(wardrobeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  lastWornAt: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
});

export const insertTryonJobSchema = createInsertSchema(tryonJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentJobSchema = createInsertSchema(contentJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WardrobeItem = typeof wardrobeItems.$inferSelect;
export type InsertWardrobeItem = z.infer<typeof insertWardrobeItemSchema>;
export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;
export type TryonJob = typeof tryonJobs.$inferSelect;
export type ContentJob = typeof contentJobs.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type Event = typeof events.$inferSelect;
export type ImageMetadata = typeof imageMetadata.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type SkinSnapshotRecord = typeof skinSnapshots.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
