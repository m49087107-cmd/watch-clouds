import { Router } from "express";
import { db, moviesTable, castMembersTable } from "@workspace/db";
import { TmdbSearchQueryParams, TmdbImportBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";
import { logger } from "../lib/logger";

const router = Router();

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

function getTmdbApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not set");
  return key;
}

async function tmdbFetch(path: string): Promise<unknown> {
  const apiKey = getTmdbApiKey();
  const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

// GET /tmdb/search
router.get("/tmdb/search", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = TmdbSearchQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { query, type = "movie" } = parsed.data;

  try {
    const endpoint = type === "tv" ? "tv" : "movie";
    const data = await tmdbFetch(`/search/${endpoint}?query=${encodeURIComponent(query)}`) as { results: unknown[] };

    const results = (data.results || []).slice(0, 10).map((item: Record<string, unknown>) => {
      const isTV = type === "tv";
      const title = isTV ? (item.name as string) : (item.title as string);
      const date = isTV ? (item.first_air_date as string) : (item.release_date as string);
      const year = date ? parseInt(date.split("-")[0], 10) : 0;
      const posterPath = item.poster_path as string | null;
      const backdropPath = item.backdrop_path as string | null;

      return {
        tmdbId: item.id,
        title,
        type: isTV ? "webseries" : "movie",
        posterUrl: posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : "https://via.placeholder.com/500x750?text=No+Poster",
        backdropUrl: backdropPath ? `${TMDB_BACKDROP_BASE}${backdropPath}` : null,
        year: isNaN(year) ? 0 : year,
        rating: Math.round(((item.vote_average as number) || 0) * 10) / 10,
        overview: (item.overview as string) || null,
      };
    });

    res.json(results);
  } catch (err) {
    logger.error({ err }, "TMDB search failed");
    res.status(500).json({ error: "TMDB search failed. Check TMDB_API_KEY." });
  }
});

// POST /tmdb/import
router.post("/tmdb/import", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = TmdbImportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tmdbId, mediaType } = parsed.data;
  const isTV = mediaType === "tv";

  try {
    const endpoint = isTV ? "tv" : "movie";
    const [detail, credits] = await Promise.all([
      tmdbFetch(`/${endpoint}/${tmdbId}`) as Promise<Record<string, unknown>>,
      tmdbFetch(`/${endpoint}/${tmdbId}/credits`) as Promise<{ cast: unknown[] }>,
    ]);

    const title = isTV ? (detail.name as string) : (detail.title as string);
    const date = isTV ? (detail.first_air_date as string) : (detail.release_date as string);
    const year = date ? parseInt(date.split("-")[0], 10) : 0;
    const posterPath = detail.poster_path as string | null;
    const backdropPath = detail.backdrop_path as string | null;
    const genres = ((detail.genres as { name: string }[]) || []).map(g => g.name);
    const runtime = isTV
      ? ((detail.episode_run_time as number[])?.[0] ?? null)
      : (detail.runtime as number | null);

    const [movie] = await db.insert(moviesTable).values({
      title,
      type: isTV ? "webseries" : "movie",
      posterUrl: posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : "https://via.placeholder.com/500x750?text=No+Poster",
      backdropUrl: backdropPath ? `${TMDB_BACKDROP_BASE}${backdropPath}` : null,
      year: isNaN(year) ? 0 : year,
      rating: Math.round(((detail.vote_average as number) || 0) * 10) / 10,
      genres,
      overview: (detail.overview as string) || null,
      tmdbId,
      isFeatured: false,
      language: (detail.original_language as string) || "en",
      runtime,
    }).returning();

    // Import cast
    const cast = (credits.cast || []).slice(0, 15).map((c: Record<string, unknown>, i: number) => ({
      movieId: movie.id,
      name: c.name as string,
      character: c.character as string || null,
      profileUrl: c.profile_path ? `${TMDB_IMAGE_BASE}${c.profile_path}` : null,
      orderIndex: i,
    }));

    if (cast.length > 0) {
      await db.insert(castMembersTable).values(cast);
    }

    res.status(201).json({
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
    });
  } catch (err) {
    logger.error({ err }, "TMDB import failed");
    res.status(500).json({ error: "TMDB import failed. Check TMDB_API_KEY." });
  }
});

export default router;
