import { Router } from "express";
import { db, moviesTable, usersTable, watchlistTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { ListUsersQueryParams, UpdateUserBody, UpdateUserParams, DeleteUserParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    watchlistCount: user.watchlistCount,
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /admin/stats
router.get("/admin/stats", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const [totalMoviesResult, totalUsersResult, totalWatchlistResult, moviesByTypeResult, recentMovies] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(moviesTable),
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(watchlistTable),
    db.select({ type: moviesTable.type, count: sql<number>`count(*)` }).from(moviesTable).groupBy(moviesTable.type),
    db.select().from(moviesTable).orderBy(desc(moviesTable.createdAt)).limit(5),
  ]);

  const moviesByType: Record<string, number> = {};
  for (const row of moviesByTypeResult) {
    moviesByType[row.type] = Number(row.count);
  }

  res.json({
    totalMovies: Number(totalMoviesResult[0]?.count ?? 0),
    totalUsers: Number(totalUsersResult[0]?.count ?? 0),
    totalWatchlistEntries: Number(totalWatchlistResult[0]?.count ?? 0),
    moviesByType,
    recentMovies: recentMovies.map(m => ({
      id: String(m.id),
      title: m.title,
      type: m.type,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      year: m.year,
      rating: m.rating,
      genres: m.genres,
      overview: m.overview,
      tmdbId: m.tmdbId,
      isFeatured: m.isFeatured,
      streamUrl: m.streamUrl,
      trailerUrl: m.trailerUrl,
      runtime: m.runtime,
      language: m.language,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

// GET /admin/users
router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const [users, countResult] = await Promise.all([
    db.select().from(usersTable).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    users: users.map(formatUser),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// PATCH /admin/users/:id
router.patch("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const paramParsed = UpdateUserParams.safeParse(req.params);
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = Number(paramParsed.data.id);
  const updateData: Record<string, unknown> = {};
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

// DELETE /admin/users/:id
router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const paramParsed = DeleteUserParams.safeParse(req.params);
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const id = Number(paramParsed.data.id);
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ message: "User deleted" });
});

export default router;
