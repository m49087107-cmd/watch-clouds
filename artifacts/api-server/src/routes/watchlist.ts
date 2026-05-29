import { Router } from "express";
import { db, watchlistTable, moviesTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";

type AuthRequest = Request & { user: JwtPayload };

const router = Router();

function formatMovie(movie: typeof moviesTable.$inferSelect) {
  return {
    id: String(movie.id),
    title: movie.title,
    type: movie.type,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    year: movie.year,
    rating: movie.rating,
    genres: movie.genres,
    overview: movie.overview,
    tmdbId: movie.tmdbId,
    isFeatured: movie.isFeatured,
    streamUrl: movie.streamUrl,
    trailerUrl: movie.trailerUrl,
    runtime: movie.runtime,
    language: movie.language,
    createdAt: movie.createdAt.toISOString(),
  };
}

// GET /watchlist
router.get("/watchlist", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user.userId;

  const entries = await db
    .select({ movie: moviesTable })
    .from(watchlistTable)
    .innerJoin(moviesTable, eq(watchlistTable.movieId, moviesTable.id))
    .where(eq(watchlistTable.userId, userId));

  res.json(entries.map(e => formatMovie(e.movie)));
});

// POST /watchlist/:movieId
router.post("/watchlist/:movieId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const movieId = parseInt(req.params.movieId as string, 10);
  if (isNaN(movieId)) {
    res.status(400).json({ error: "Invalid movieId" });
    return;
  }

  const userId = req.user.userId;

  await db.insert(watchlistTable).values({ userId, movieId }).onConflictDoNothing();

  // Update watchlist count
  await db.update(usersTable)
    .set({ watchlistCount: sql`${usersTable.watchlistCount} + 1` })
    .where(eq(usersTable.id, userId));

  res.json({ message: "Added to watchlist" });
});

// DELETE /watchlist/:movieId
router.delete("/watchlist/:movieId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const movieId = parseInt(req.params.movieId as string, 10);
  if (isNaN(movieId)) {
    res.status(400).json({ error: "Invalid movieId" });
    return;
  }

  const userId = req.user.userId;

  await db.delete(watchlistTable)
    .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.movieId, movieId)));

  // Update watchlist count
  await db.update(usersTable)
    .set({ watchlistCount: sql`GREATEST(${usersTable.watchlistCount} - 1, 0)` })
    .where(eq(usersTable.id, userId));

  res.json({ message: "Removed from watchlist" });
});

export default router;
