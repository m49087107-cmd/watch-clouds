import { pgTable, text, serial, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moviesTable = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("movie"),
  posterUrl: text("poster_url").notNull(),
  backdropUrl: text("backdrop_url"),
  year: integer("year").notNull(),
  rating: real("rating").notNull().default(0),
  genres: text("genres").array().notNull().default([]),
  overview: text("overview"),
  tmdbId: integer("tmdb_id"),
  isFeatured: boolean("is_featured").notNull().default(false),
  streamUrl: text("stream_url"),
  trailerUrl: text("trailer_url"),
  runtime: integer("runtime"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMovieSchema = createInsertSchema(moviesTable).omit({ id: true, createdAt: true });
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof moviesTable.$inferSelect;
