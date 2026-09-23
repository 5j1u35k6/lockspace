import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  pronouns: text("pronouns"),
  bio: text("bio"),
  lockBrand: text("lock_brand"),
  lockColor: text("lock_color"),
  cageLengthCm: text("cage_length_cm"),
  cageWidthCm: text("cage_width_cm"),
  bodyLengthCm: text("body_length_cm"),
  bodyGirthCm: text("body_girth_cm"),
  heightCm: text("height_cm"),
  weightKg: text("weight_kg"),
  skinTone: text("skin_tone"),
  bodyType: text("body_type"),
  adultAttestedAt: integer("adult_attested_at").notNull(),
  publicProfileConsentAt: integer("public_profile_consent_at").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const dailyTasks = sqliteTable("daily_tasks", {
  taskDate: text("task_date").primaryKey(),
  code: text("code").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => profiles.userId, { onDelete: "cascade" }),
  taskDate: text("task_date").notNull().references(() => dailyTasks.taskDate),
  objectKey: text("object_key").notNull().unique(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("submissions_task_date_created_idx").on(table.taskDate, table.createdAt)]);

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => profiles.userId, { onDelete: "cascade" }),
  result: text("result", { enum: ["pass", "retry"] }).notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("votes_submission_user_unique").on(table.submissionId, table.userId),
  index("votes_submission_idx").on(table.submissionId),
]);

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  reporterUserId: text("reporter_user_id").notNull().references(() => profiles.userId, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("reports_submission_reporter_unique").on(table.submissionId, table.reporterUserId)]);
