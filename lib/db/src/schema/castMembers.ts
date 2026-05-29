import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const castMembersTable = pgTable("cast_members", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  name: text("name").notNull(),
  character: text("character"),
  profileUrl: text("profile_url"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCastMemberSchema = createInsertSchema(castMembersTable).omit({ id: true, createdAt: true });
export type InsertCastMember = z.infer<typeof insertCastMemberSchema>;
export type CastMember = typeof castMembersTable.$inferSelect;
