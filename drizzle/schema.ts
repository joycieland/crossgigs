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
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  requiredSkills: text("requiredSkills").notNull(), // JSON array stored as text
  paymentAmount: varchar("paymentAmount", { length: 50 }).notNull(), // USDC amount as string to preserve precision
  status: mysqlEnum("status", ["active", "completed"]).default("active").notNull(),
  completedBy: varchar("completedBy", { length: 255 }), // Wallet address of freelancer
  submissionUrl: text("submissionUrl"), // Link to deliverable (GitHub, Figma, deployed site, etc.)
  submissionDescription: text("submissionDescription"), // Brief description of what was delivered
  submissionFiles: text("submissionFiles"), // JSON array of S3 file URLs
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  fromAddress: varchar("fromAddress", { length: 255 }).notNull(), // Agent wallet address
  toAddress: varchar("toAddress", { length: 255 }).notNull(), // Freelancer wallet address
  amount: varchar("amount", { length: 50 }).notNull(), // USDC amount
  transactionHash: varchar("transactionHash", { length: 255 }).notNull(),
  explorerLink: text("explorerLink"), // Link to block explorer
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;