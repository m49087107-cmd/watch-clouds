import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateReviewBody, CreateReviewParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";

type AuthRequest = Request & { user: JwtPayload };

const router = Router();

// GET /movies/:id/reviews
router.get("/movies/:id/reviews", async (req, res): Promise<void> => {
  const movieId = parseInt(req.params.id as string, 10);
  if (isNaN(movieId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const reviews = await db
    .select({ review: reviewsTable, user: usersTable })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.movieId, movieId));

  res.json(reviews.map(r => ({
    id: String(r.review.id),
    userId: String(r.review.userId),
    userName: r.user.name,
    movieId: String(r.review.movieId),
    rating: r.review.rating,
    comment: r.review.comment,
    createdAt: r.review.createdAt.toISOString(),
  })));
});

// POST /movies/:id/reviews
router.post("/movies/:id/reviews", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const movieId = parseInt(req.params.id as string, 10);
  if (isNaN(movieId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user.userId;

  const [review] = await db.insert(reviewsTable).values({
    userId,
    movieId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  }).onConflictDoNothing().returning();

  if (!review) {
    res.status(400).json({ error: "Review already exists" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  res.status(201).json({
    id: String(review.id),
    userId: String(review.userId),
    userName: user?.name ?? "Unknown",
    movieId: String(review.movieId),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
