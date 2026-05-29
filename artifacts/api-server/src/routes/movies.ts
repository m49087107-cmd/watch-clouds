import { Router } from "express";
import { db, moviesTable, watchlistTable, castMembersTable, usersTable } from "@workspace/db";
import { eq, desc, ilike, and, or, inArray, sql } from "drizzle-orm";
import {
  ListMoviesQueryParams,
  CreateMovieBody,
  UpdateMovieBody,
  UpdateMovieParams,
  DeleteMovieParams,
  GetMovieParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";
import { optionalAuth } from "../middlewares/optionalAuth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";

const router = Router();

type AuthRequest = Request & { user?: JwtPayload };

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

// GET /movies
router.get("/movies", async (req, res): Promise<void> => {
  const parsed = ListMoviesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, genre, search, page = 1, limit = 20, featured } = parsed.data;

  const conditions = [];
  if (type) conditions.push(eq(moviesTable.type, type));
  if (featured) conditions.push(eq(moviesTable.isFeatured, true));
  if (search) conditions.push(ilike(moviesTable.title, `%${search}%`));
  if (genre) conditions.push(sql`${genre} = ANY(${moviesTable.genres})`);

  const offset = (page - 1) * limit;

  const [movies, countResult] = await Promise.all([
    db.select().from(moviesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(moviesTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(moviesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    movies: movies.map(formatMovie),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /movies/trending
router.get("/movies/trending", async (_req, res): Promise<void> => {
  const movies = await db.select().from(moviesTable)
    .orderBy(desc(moviesTable.rating))
    .limit(12);
  res.json(movies.map(formatMovie));
});

// GET /movies/featured
router.get("/movies/featured", async (_req, res): Promise<void> => {
  const movies = await db.select().from(moviesTable)
    .where(eq(moviesTable.isFeatured, true))
    .orderBy(desc(moviesTable.createdAt))
    .limit(5);
  res.json(movies.map(formatMovie));
});

// GET /movies/genres
router.get("/movies/genres", async (_req, res): Promise<void> => {
  const movies = await db.select({ genres: moviesTable.genres }).from(moviesTable);
  const allGenres = new Set<string>();
  for (const m of movies) {
    for (const g of m.genres) allGenres.add(g);
  }
  res.json(Array.from(allGenres).sort());
});

// GET /movies/:id
router.get("/movies/:id", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [movie] = await db.select().from(moviesTable).where(eq(moviesTable.id, id));
  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  const cast = await db.select().from(castMembersTable)
    .where(eq(castMembersTable.movieId, id))
    .orderBy(castMembersTable.orderIndex)
    .limit(20);

  let inWatchlist = false;
  if (req.user) {
    const [entry] = await db.select().from(watchlistTable)
      .where(and(eq(watchlistTable.userId, req.user.userId), eq(watchlistTable.movieId, id)));
    inWatchlist = !!entry;
  }

  res.json({
    ...formatMovie(movie),
    cast: cast.map(c => ({ name: c.name, character: c.character, profileUrl: c.profileUrl })),
    inWatchlist,
  });
});

// POST /movies (admin)
router.post("/movies", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateMovieBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { cast, ...movieData } = parsed.data as typeof parsed.data & { cast?: Array<{ name: string; character?: string; profileUrl?: string }> };

  const [movie] = await db.insert(moviesTable).values({
    title: movieData.title,
    type: movieData.type,
    posterUrl: movieData.posterUrl,
    backdropUrl: movieData.backdropUrl,
    year: movieData.year,
    rating: movieData.rating,
    genres: movieData.genres,
    overview: movieData.overview,
    tmdbId: movieData.tmdbId,
    isFeatured: movieData.isFeatured ?? false,
    streamUrl: movieData.streamUrl,
    trailerUrl: movieData.trailerUrl,
    runtime: movieData.runtime,
    language: movieData.language,
  }).returning();

  if (cast && cast.length > 0) {
    const castValues = cast
      .filter((c): c is { name: string; character?: string; profileUrl?: string } => typeof c.name === "string")
      .map((c, i) => ({ movieId: movie.id, name: c.name, character: c.character ?? null, profileUrl: c.profileUrl ?? null, orderIndex: i }));
    if (castValues.length > 0) {
      await db.insert(castMembersTable).values(castValues);
    }
  }

  res.status(201).json(formatMovie(movie));
});

// PATCH /movies/:id (admin)
router.patch("/movies/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const paramParsed = UpdateMovieParams.safeParse(req.params);
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateMovieBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = Number(paramParsed.data.id);
  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.title !== undefined) updateData.title = d.title;
  if (d.type !== undefined) updateData.type = d.type;
  if (d.posterUrl !== undefined) updateData.posterUrl = d.posterUrl;
  if (d.backdropUrl !== undefined) updateData.backdropUrl = d.backdropUrl;
  if (d.year !== undefined) updateData.year = d.year;
  if (d.rating !== undefined) updateData.rating = d.rating;
  if (d.genres !== undefined) updateData.genres = d.genres;
  if (d.overview !== undefined) updateData.overview = d.overview;
  if (d.isFeatured !== undefined) updateData.isFeatured = d.isFeatured;
  if (d.streamUrl !== undefined) updateData.streamUrl = d.streamUrl;
  if (d.trailerUrl !== undefined) updateData.trailerUrl = d.trailerUrl;
  if (d.runtime !== undefined) updateData.runtime = d.runtime;
  if (d.language !== undefined) updateData.language = d.language;

  const [movie] = await db.update(moviesTable).set(updateData).where(eq(moviesTable.id, id)).returning();
  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.json(formatMovie(movie));
});

// DELETE /movies/:id (admin)
router.delete("/movies/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const paramParsed = DeleteMovieParams.safeParse(req.params);
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const id = Number(paramParsed.data.id);
  const [movie] = await db.delete(moviesTable).where(eq(moviesTable.id, id)).returning();
  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.json({ message: "Movie deleted successfully" });
});

export default router;
