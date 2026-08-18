import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const news = pgTable("news", {
  id: serial().primaryKey(),
  title: text().notNull(),
  category: text().notNull().default("News"),
  excerpt: text().notNull().default(""),
  author: text().notNull().default("FootballZone Staff"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fixtures = pgTable("fixtures", {
  id: serial().primaryKey(),
  competition: text().notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  matchDate: timestamp("match_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
